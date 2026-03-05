import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { Repository } from 'typeorm';

import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { AuthTokenEntity, AuthTokenType } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';

const DEFAULT_BCRYPT_ROUNDS = 12;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

export interface AuthTokenIssueResult {
  token: string;
  expiresAt: Date;
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
  ) {}

  async upsertPassword(userId: string, plaintextPassword: string): Promise<void> {
    this.ensurePasswordStrength(plaintextPassword);

    const passwordHash = await bcrypt.hash(plaintextPassword, DEFAULT_BCRYPT_ROUNDS);
    const existing = await this.credentialRepository.findOne({ where: { userId } });

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

  async verifyPassword(userId: string, plaintextPassword: string): Promise<boolean> {
    const credentials = await this.credentialRepository.findOne({ where: { userId } });
    if (!credentials) {
      return false;
    }

    return bcrypt.compare(plaintextPassword, credentials.passwordHash);
  }

  async issuePasswordReset(userId: string): Promise<AuthTokenIssueResult> {
    return this.issueToken(userId, AuthTokenType.PASSWORD_RESET, PASSWORD_RESET_TTL_MS);
  }

  async resetPassword(
    userId: string,
    plaintextToken: string,
    newPlaintextPassword: string,
  ): Promise<void> {
    const token = await this.consumeToken(
      userId,
      plaintextToken,
      AuthTokenType.PASSWORD_RESET,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    await this.upsertPassword(userId, newPlaintextPassword);
    await this.tokenRepository.delete({
      userId,
      type: AuthTokenType.PASSWORD_RESET,
      consumedAt: null,
    });
  }

  async issueEmailVerification(userId: string): Promise<AuthTokenIssueResult> {
    await this.ensureUserState(userId);
    return this.issueToken(
      userId,
      AuthTokenType.EMAIL_VERIFICATION,
      EMAIL_VERIFICATION_TTL_MS,
    );
  }

  async verifyEmail(userId: string, plaintextToken: string): Promise<void> {
    const token = await this.consumeToken(
      userId,
      plaintextToken,
      AuthTokenType.EMAIL_VERIFICATION,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid or expired email verification token');
    }

    const userState = await this.ensureUserState(userId);
    userState.emailVerified = true;
    userState.emailVerifiedAt = new Date();
    await this.stateRepository.save(userState);
  }

  private async issueToken(
    userId: string,
    type: AuthTokenType,
    ttlMs: number,
  ): Promise<AuthTokenIssueResult> {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + ttlMs);

    await this.tokenRepository.delete({ userId, type, consumedAt: null });

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
    userId: string,
    plaintextToken: string,
    type: AuthTokenType,
  ): Promise<AuthTokenEntity | null> {
    const tokenHash = this.hashToken(plaintextToken);
    const token = await this.tokenRepository.findOne({
      where: { userId, type, tokenHash, consumedAt: null },
    });

    if (!token || token.expiresAt.getTime() < Date.now()) {
      return null;
    }

    token.consumedAt = new Date();
    await this.tokenRepository.save(token);
    return token;
  }

  private async ensureUserState(userId: string): Promise<AuthUserStateEntity> {
    const existing = await this.stateRepository.findOne({ where: { userId } });
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
}
