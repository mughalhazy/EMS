import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserEntity, UserStatus } from '../../user/src/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacService } from './rbac.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly auditService: AuditService,
    private readonly rbacService: RbacService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() payload: LoginDto): Promise<TokenPairDto> {
    const user = await this.userRepository.findOne({
      where: { tenantId: payload.tenantId, email: payload.email },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await this.authService.verifyPassword(
      payload.tenantId,
      user.id,
      payload.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const session = await this.issueSession(user, payload.userAgent, payload.ip);
    await this.auditService.trackAuthChange({
      tenantId: user.tenantId,
      actorUserId: user.id,
      targetUserId: user.id,
      action: 'auth.login',
      metadata: { ip: payload.ip ?? null, userAgent: payload.userAgent ?? null },
    });

    return session;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() payload: RefreshTokenDto): Promise<TokenPairDto> {
    let decoded: { sub: string; tid: string };

    try {
      decoded = this.jwtTokenService.verify(payload.refreshToken, 'refresh');
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.jwtTokenService.hashToken(payload.refreshToken);
    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        userId: decoded.sub,
        tenantId: decoded.tid,
        tokenHash,
        revokedAt: null,
      },
    });

    if (!storedToken || storedToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: decoded.sub, tenantId: decoded.tid, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new UnauthorizedException('User is not active');
    }

    const nextSession = await this.issueSession(user, payload.userAgent, payload.ip);

    storedToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(storedToken);
    await this.auditService.trackAuthChange({
      tenantId: user.tenantId,
      actorUserId: user.id,
      targetUserId: user.id,
      action: 'auth.refresh',
    });

    return nextSession;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() payload: RefreshTokenDto): Promise<void> {
    try {
      const decoded = this.jwtTokenService.verify(payload.refreshToken, 'refresh');
      const tokenHash = this.jwtTokenService.hashToken(payload.refreshToken);
      const storedToken = await this.refreshTokenRepository.findOne({
        where: {
          userId: decoded.sub,
          tenantId: decoded.tid,
          tokenHash,
          revokedAt: null,
        },
      });

      if (storedToken) {
        storedToken.revokedAt = new Date();
        await this.refreshTokenRepository.save(storedToken);
      }

      await this.auditService.trackAuthChange({
        tenantId: decoded.tid,
        actorUserId: decoded.sub,
        targetUserId: decoded.sub,
        action: 'auth.logout',
      });
    } catch {
      return;
    }
  }

  @Post('password-reset/request/:tenantId/:userId')
  async issuePasswordReset(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.authService.issuePasswordReset(tenantId, userId);
  }

  @Post('password-reset/confirm/:tenantId/:userId')
  async confirmPasswordReset(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() payload: { token: string; newPassword: string },
  ): Promise<void> {
    await this.authService.resetPassword(tenantId, userId, payload.token, payload.newPassword);
    await this.auditService.trackAuthChange({
      tenantId,
      actorUserId: userId,
      targetUserId: userId,
      action: 'auth.password.reset',
    });
  }

  @Get('sso/:tenantId/providers')
  @UseGuards(JwtAuthGuard)
  async listSsoProviders(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.authService.getTenantSsoProviders(tenantId);
  }

  private async issueSession(
    user: UserEntity,
    userAgent?: string,
    ip?: string,
  ): Promise<TokenPairDto> {
    const accessToken = this.jwtTokenService.signAccessToken(user.id, user.tenantId);
    const refreshToken = this.jwtTokenService.signRefreshToken(user.id, user.tenantId);

    const refreshTokenRecord = this.refreshTokenRepository.create({
      tenantId: user.tenantId,
      userId: user.id,
      tokenHash: this.jwtTokenService.hashToken(refreshToken.token),
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      expiresAt: refreshToken.expiresAt,
      revokedAt: null,
      replacedBy: null,
    });
    await this.refreshTokenRepository.save(refreshTokenRecord);

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const { roles, permissions } = await this.rbacService.getUserRbac(user.tenantId, user.id);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessTokenExpiresAt: accessToken.expiresAt,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      user: {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        roleNames: roles,
        permissions,
      },
    };
  }
}
