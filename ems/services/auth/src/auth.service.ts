import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';

import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { AuthFederatedIdentityEntity } from './entities/auth-federated-identity.entity';
import {
  AuthSsoProviderEntity,
  AuthSsoProviderType,
} from './entities/auth-sso-provider.entity';
import { AuthTokenEntity, AuthTokenType } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';
import { UserEntity, UserStatus } from '../../user/src/entities/user.entity';
import { TenantContext } from './tenant-context';

const DEFAULT_BCRYPT_ROUNDS = 12;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

export interface AuthTokenIssueResult {
  token: string;
  expiresAt: Date;
}

export interface UpsertSsoProviderInput {
  tenantId: string;
  type: AuthSsoProviderType;
  slug: string;
  name: string;
  enabled?: boolean;
  configuration: Record<string, unknown>;
}

export interface FederatedSignInInput {
  tenantId: string;
  providerSlug: string;
  providerType: AuthSsoProviderType;
  subject: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  allowJitProvisioning?: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthCredentialEntity)
    private readonly credentialRepository: Repository<AuthCredentialEntity>,
    @InjectRepository(AuthTokenEntity)
    private readonly tokenRepository: Repository<AuthTokenEntity>,
    @InjectRepository(AuthUserStateEntity)
    private readonly stateRepository: Repository<AuthUserStateEntity>,
    @InjectRepository(AuthSsoProviderEntity)
    private readonly ssoProviderRepository: Repository<AuthSsoProviderEntity>,
    @InjectRepository(AuthFederatedIdentityEntity)
    private readonly federatedIdentityRepository: Repository<AuthFederatedIdentityEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async upsertSsoProvider(input: UpsertSsoProviderInput): Promise<AuthSsoProviderEntity> {
    const existing = await this.ssoProviderRepository.findOne({
      where: { tenantId: input.tenantId, slug: input.slug },
    });

    const provider = existing ?? this.ssoProviderRepository.create();
    provider.tenantId = input.tenantId;
    provider.type = input.type;
    provider.slug = input.slug;
    provider.name = input.name;
    provider.enabled = input.enabled ?? true;
    provider.configuration = input.configuration;

    return this.ssoProviderRepository.save(provider);
  }

  async getTenantSsoProviders(tenantId: string): Promise<AuthSsoProviderEntity[]> {
    return this.ssoProviderRepository.find({
      where: { tenantId, enabled: true },
      order: { name: 'ASC' },
    });
  }

  async signInWithFederatedIdentity(input: FederatedSignInInput): Promise<UserEntity> {
    const provider = await this.ssoProviderRepository.findOne({
      where: {
        tenantId: input.tenantId,
        slug: input.providerSlug,
        type: input.providerType,
        enabled: true,
      },
    });

    if (!provider) {
      throw new UnauthorizedException('SSO provider is not configured for the tenant');
    }

    const existingIdentity = await this.federatedIdentityRepository.findOne({
      where: { providerId: provider.id, subject: input.subject },
    });

    if (existingIdentity) {
      const existingUser = await this.userRepository.findOne({
        where: { id: existingIdentity.userId },
      });

      if (!existingUser) {
        throw new UnauthorizedException('Federated identity is linked to an unknown user');
      }

      existingIdentity.email = input.email ?? existingIdentity.email;
      existingIdentity.firstName = input.firstName ?? existingIdentity.firstName;
      existingIdentity.lastName = input.lastName ?? existingIdentity.lastName;
      existingIdentity.lastAuthenticatedAt = new Date();
      await this.federatedIdentityRepository.save(existingIdentity);

      existingUser.lastLoginAt = new Date();
      await this.userRepository.save(existingUser);
      return existingUser;
    }

    if (!input.email) {
      throw new UnauthorizedException('Federated sign-in requires an email claim');
    }

    const existingByEmail = await this.userRepository.findOne({
      where: { tenantId: input.tenantId, email: input.email },
    });

    if (existingByEmail) {
      return this.linkFederatedIdentity(provider.id, existingByEmail, input);
    }

    if (!input.allowJitProvisioning) {
      throw new UnauthorizedException('No matching user account found for federated sign-in');
    }

    const createdUser = await this.userRepository.save(
      this.userRepository.create({
        tenantId: input.tenantId,
        email: input.email,
        firstName: input.firstName ?? 'SSO',
        lastName: input.lastName ?? 'User',
        status: UserStatus.ACTIVE,
        lastLoginAt: new Date(),
      }),
    );

    return this.linkFederatedIdentity(provider.id, createdUser, input);
  }

  async upsertPassword(
    tenantId: string | undefined,
    userId: string,
    plaintextPassword: string,
  ): Promise<void> {
    this.ensurePasswordStrength(plaintextPassword);

    const scopedTenantId = this.resolveTenantId(tenantId);
    const passwordHash = await bcrypt.hash(plaintextPassword, DEFAULT_BCRYPT_ROUNDS);
    const existing = await this.findCredentialByTenantAndUserId(scopedTenantId, userId);

    if (existing) {
      existing.passwordHash = passwordHash;
      existing.passwordChangedAt = new Date();
      await this.credentialRepository.save(existing);
      return;
    }

    await this.credentialRepository.save(
      this.credentialRepository.create({
        userId,
        passwordHash,
        passwordChangedAt: new Date(),
      }),
    );
  }

  async verifyPassword(
    tenantId: string | undefined,
    userId: string,
    plaintextPassword: string,
  ): Promise<boolean> {
    const scopedTenantId = this.resolveTenantId(tenantId);
    const credentials = await this.findCredentialByTenantAndUserId(scopedTenantId, userId);
    if (!credentials) {
      return false;
    }

    return bcrypt.compare(plaintextPassword, credentials.passwordHash);
  }

  async issuePasswordReset(tenantId: string | undefined, userId: string): Promise<AuthTokenIssueResult> {
    const scopedTenantId = this.resolveTenantId(tenantId);
    return this.issueToken(scopedTenantId, userId, AuthTokenType.PASSWORD_RESET, PASSWORD_RESET_TTL_MS);
  }

  async resetPassword(
    tenantId: string | undefined,
    userId: string,
    plaintextToken: string,
    newPlaintextPassword: string,
  ): Promise<void> {
    const scopedTenantId = this.resolveTenantId(tenantId);
    const token = await this.consumeToken(
      scopedTenantId,
      userId,
      plaintextToken,
      AuthTokenType.PASSWORD_RESET,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    await this.upsertPassword(scopedTenantId, userId, newPlaintextPassword);
    const activeResetTokens = await this.findTokensByTenantAndType(
      scopedTenantId,
      userId,
      AuthTokenType.PASSWORD_RESET,
    );
    if (activeResetTokens.length) {
      await this.tokenRepository.remove(activeResetTokens);
    }
  }

  async issueEmailVerification(tenantId: string | undefined, userId: string): Promise<AuthTokenIssueResult> {
    const scopedTenantId = this.resolveTenantId(tenantId);
    await this.ensureUserState(scopedTenantId, userId);
    return this.issueToken(
      scopedTenantId,
      userId,
      AuthTokenType.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_TTL_MS,
    );
  }

  async verifyEmail(tenantId: string | undefined, userId: string, plaintextToken: string): Promise<void> {
    const scopedTenantId = this.resolveTenantId(tenantId);
    const token = await this.consumeToken(
      scopedTenantId,
      userId,
      plaintextToken,
      AuthTokenType.EMAIL_VERIFICATION,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid or expired email verification token');
    }

    const userState = await this.ensureUserState(scopedTenantId, userId);
    userState.emailVerified = true;
    userState.emailVerifiedAt = new Date();
    await this.stateRepository.save(userState);
  }

  private async issueToken(
    tenantId: string,
    userId: string,
    type: AuthTokenType,
    ttlMs: number,
  ): Promise<AuthTokenIssueResult> {
    await this.ensureTenantUserExists(tenantId, userId);

    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + ttlMs);

    const activeTokens = await this.findTokensByTenantAndType(tenantId, userId, type);
    if (activeTokens.length) {
      await this.tokenRepository.remove(activeTokens);
    }

    await this.tokenRepository.save(
      this.tokenRepository.create({
        userId,
        type,
        tokenHash,
        expiresAt,
        consumedAt: null,
      }),
    );

    return { token, expiresAt };
  }

  private async consumeToken(
    tenantId: string,
    userId: string,
    plaintextToken: string,
    type: AuthTokenType,
  ): Promise<AuthTokenEntity | null> {
    const tokenHash = this.hashToken(plaintextToken);
    const token = await this.findTokenByTenantAndHash(tenantId, userId, type, tokenHash);

    if (!token || token.expiresAt.getTime() < Date.now()) {
      return null;
    }

    token.consumedAt = new Date();
    await this.tokenRepository.save(token);
    return token;
  }

  private async ensureUserState(
    tenantId: string,
    userId: string,
  ): Promise<AuthUserStateEntity> {
    const existing = await this.findUserStateByTenantAndUserId(tenantId, userId);
    if (existing) {
      return existing;
    }

    return this.stateRepository.save(
      this.stateRepository.create({
        userId,
        emailVerified: false,
        emailVerifiedAt: null,
      }),
    );
  }

  private resolveTenantId(tenantId?: string): string {
    return tenantId ?? TenantContext.requireTenantId();
  }

  private async ensureTenantUserExists(tenantId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId, tenantId } });

    if (!user) {
      throw new NotFoundException('User does not exist for the tenant');
    }
  }

  private async findCredentialByTenantAndUserId(
    tenantId: string,
    userId: string,
  ): Promise<AuthCredentialEntity | null> {
    return this.credentialRepository
      .createQueryBuilder('credential')
      .innerJoin(UserEntity, 'user', 'user.id = credential.user_id')
      .where('credential.user_id = :userId', { userId })
      .andWhere('user.tenant_id = :tenantId', { tenantId })
      .getOne();
  }

  private async findTokensByTenantAndType(
    tenantId: string,
    userId: string,
    type: AuthTokenType,
  ): Promise<AuthTokenEntity[]> {
    return this.tokenRepository
      .createQueryBuilder('token')
      .innerJoin(UserEntity, 'user', 'user.id = token.user_id')
      .where('token.user_id = :userId', { userId })
      .andWhere('token.type = :type', { type })
      .andWhere('token.consumed_at IS NULL')
      .andWhere('token.expires_at > :now', { now: new Date() })
      .andWhere('user.tenant_id = :tenantId', { tenantId })
      .getMany();
  }

  private async findTokenByTenantAndHash(
    tenantId: string,
    userId: string,
    type: AuthTokenType,
    tokenHash: string,
  ): Promise<AuthTokenEntity | null> {
    return this.tokenRepository
      .createQueryBuilder('token')
      .innerJoin(UserEntity, 'user', 'user.id = token.user_id')
      .where('token.user_id = :userId', { userId })
      .andWhere('token.type = :type', { type })
      .andWhere('token.token_hash = :tokenHash', { tokenHash })
      .andWhere('token.consumed_at IS NULL')
      .andWhere('user.tenant_id = :tenantId', { tenantId })
      .getOne();
  }

  private async findUserStateByTenantAndUserId(
    tenantId: string,
    userId: string,
  ): Promise<AuthUserStateEntity | null> {
    return this.stateRepository
      .createQueryBuilder('state')
      .innerJoin(UserEntity, 'user', 'user.id = state.user_id')
      .where('state.user_id = :userId', { userId })
      .andWhere('user.tenant_id = :tenantId', { tenantId })
      .getOne();
  }

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private ensurePasswordStrength(password: string): void {
    if (password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters');
    }
  }

  private async linkFederatedIdentity(
    providerId: string,
    user: UserEntity,
    input: FederatedSignInInput,
  ): Promise<UserEntity> {
    await this.federatedIdentityRepository.save(
      this.federatedIdentityRepository.create({
        providerId,
        userId: user.id,
        subject: input.subject,
        email: input.email ?? null,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        lastAuthenticatedAt: new Date(),
      }),
    );

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
    return user;
  }
}
