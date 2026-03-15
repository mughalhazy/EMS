import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { AuthSessionEntity } from './entities/auth-session.entity';
import { UserEntity, UserStatus } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacService } from './rbac.service';
import { ApiDataResponseDto } from './dto/api-response.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly auditService: AuditService,
    private readonly rbacService: RbacService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AuthSessionEntity)
    private readonly authSessionRepository: Repository<AuthSessionEntity>,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() payload: LoginDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<TokenPairDto>> {
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

    return this.successResponse(session, request);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() payload: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<TokenPairDto>> {
    let decoded: { sub: string; tid: string };

    try {
      decoded = this.jwtTokenService.verify(payload.refreshToken, 'refresh');
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.jwtTokenService.hashToken(payload.refreshToken);
    const storedToken = await this.authSessionRepository.findOne({
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
    await this.authSessionRepository.save(storedToken);
    await this.auditService.trackAuthChange({
      tenantId: user.tenantId,
      actorUserId: user.id,
      targetUserId: user.id,
      action: 'auth.refresh',
    });

    return this.successResponse(nextSession, request);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() payload: RefreshTokenDto): Promise<void> {
    try {
      const decoded = this.jwtTokenService.verify(payload.refreshToken, 'refresh');
      const tokenHash = this.jwtTokenService.hashToken(payload.refreshToken);
      const storedToken = await this.authSessionRepository.findOne({
        where: {
          userId: decoded.sub,
          tenantId: decoded.tid,
          tokenHash,
          revokedAt: null,
        },
      });

      if (storedToken) {
        storedToken.revokedAt = new Date();
        await this.authSessionRepository.save(storedToken);
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

  @Post('password-reset/request')
  async issuePasswordReset(
    @Body() payload: PasswordResetRequestDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<{ expiresAt: Date }>> {
    const resetToken = await this.authService.issuePasswordReset(payload.tenantId, payload.userId);
    return this.successResponse({ expiresAt: resetToken.expiresAt }, request);
  }

  @Post('password-reset/confirm')
  async confirmPasswordReset(
    @Body() payload: PasswordResetConfirmDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<{ success: true }>> {
    await this.authService.resetPassword(
      payload.tenantId,
      payload.userId,
      payload.token,
      payload.newPassword,
    );
    await this.auditService.trackAuthChange({
      tenantId: payload.tenantId,
      actorUserId: payload.userId,
      targetUserId: payload.userId,
      action: 'auth.password.reset',
    });
    return this.successResponse({ success: true }, request);
  }

  @Get('sso/:tenantId/providers')
  @UseGuards(JwtAuthGuard)
  async listSsoProviders(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Awaited<ReturnType<AuthService['getTenantSsoProviders']>>>> {
    const providers = await this.authService.getTenantSsoProviders(tenantId);
    return this.successResponse(providers, request);
  }

  private async issueSession(
    user: UserEntity,
    userAgent?: string,
    ip?: string,
  ): Promise<TokenPairDto> {
    const accessToken = this.jwtTokenService.signAccessToken(user.id, user.tenantId);
    const refreshToken = this.jwtTokenService.signRefreshToken(user.id, user.tenantId);

    const refreshTokenRecord = this.authSessionRepository.create({
      tenantId: user.tenantId,
      userId: user.id,
      tokenHash: this.jwtTokenService.hashToken(refreshToken.token),
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      expiresAt: refreshToken.expiresAt,
      revokedAt: null,
      replacedBy: null,
    });
    await this.authSessionRepository.save(refreshTokenRecord);

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

  private successResponse<T>(data: T, request: Request): ApiDataResponseDto<T> {
    return {
      data,
      meta: {
        requestId: request.headers['x-request-id']?.toString() ?? 'generated-request-id',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
