import { scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity, UserService } from '../../user/src';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtTokenService } from './jwt-token.service';
import { RbacService } from './rbac.service';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly rbacService: RbacService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async login(input: LoginDto): Promise<TokenPairDto> {
    const user = await this.validateUserCredentials(input.tenantId, input.email, input.password);
    const { roles, permissions } = await this.rbacService.getUserRbac(input.tenantId, user.id);

    const accessToken = this.jwtTokenService.signAccessToken(user.id, input.tenantId);
    const refreshToken = this.jwtTokenService.signRefreshToken(user.id, input.tenantId);

    const refreshTokenRecord = this.refreshTokenRepository.create({
      tenantId: input.tenantId,
      userId: user.id,
      tokenHash: this.jwtTokenService.hashToken(refreshToken.token),
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      expiresAt: refreshToken.expiresAt,
      revokedAt: null,
      replacedBy: null,
    });

    await this.refreshTokenRepository.save(refreshTokenRecord);

    user.lastLoginAt = new Date();

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      user: {
        userId: user.id,
        tenantId: input.tenantId,
        email: user.email,
        roleNames: roles,
        permissions,
      },
    };
  }

  async refresh(input: RefreshTokenDto): Promise<TokenPairDto> {
    const payload = this.jwtTokenService.verify(input.refreshToken, 'refresh');

    const existing = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash: this.jwtTokenService.hashToken(input.refreshToken),
        revokedAt: null,
      },
    });

    if (!existing || existing.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.userService.findByTenantAndId(payload.tid, payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { roles, permissions } = await this.rbacService.getUserRbac(payload.tid, payload.sub);

    const accessToken = this.jwtTokenService.signAccessToken(payload.sub, payload.tid);
    const refreshToken = this.jwtTokenService.signRefreshToken(payload.sub, payload.tid);

    const replacement = this.refreshTokenRepository.create({
      tenantId: payload.tid,
      userId: payload.sub,
      tokenHash: this.jwtTokenService.hashToken(refreshToken.token),
      userAgent: input.userAgent ?? null,
      ip: input.ip ?? null,
      expiresAt: refreshToken.expiresAt,
      revokedAt: null,
      replacedBy: null,
    });

    const createdReplacement = await this.refreshTokenRepository.save(replacement);

    existing.revokedAt = new Date();
    existing.replacedBy = createdReplacement.id;
    await this.refreshTokenRepository.save(existing);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      user: {
        userId: user.id,
        tenantId: payload.tid,
        email: user.email,
        roleNames: roles,
        permissions,
      },
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.jwtTokenService.hashToken(refreshToken);
    const existing = await this.refreshTokenRepository.findOne({ where: { tokenHash } });
    if (!existing || existing.revokedAt) {
      return;
    }

    existing.revokedAt = new Date();
    await this.refreshTokenRepository.save(existing);
  }

  async hasPermission(tenantId: string, userId: string, permissionCode: string): Promise<boolean> {
    return this.rbacService.userHasPermission(tenantId, userId, permissionCode);
  }

  private async validateUserCredentials(
    tenantId: string,
    email: string,
    password: string,
  ): Promise<UserEntity> {
    const users = await this.userService.findByTenant(tenantId);
    const user = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordHash = (user as UserEntity & { passwordHash?: string }).passwordHash;
    if (!passwordHash) {
      throw new UnauthorizedException('Password auth is not enabled for this account');
    }

    const isValid = await this.verifyPassword(password, passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    const [salt, hashed] = passwordHash.split(':');
    if (!salt || !hashed) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const expectedKey = Buffer.from(hashed, 'hex');

    if (derivedKey.byteLength !== expectedKey.byteLength) {
      return false;
    }

    return timingSafeEqual(derivedKey, expectedKey);
  }
}
