import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { UserEntity } from '../../user/src/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';
import { SecretsProviderService } from './secrets-provider.service';
import { TenantIsolationMiddleware } from './middleware/tenant-isolation.middleware';
import { RbacModule } from './rbac.module';
import { RolesController } from './roles.controller';
import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { AuthFederatedIdentityEntity } from './entities/auth-federated-identity.entity';
import { AuthSsoProviderEntity } from './entities/auth-sso-provider.entity';
import { AuthTokenEntity } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    AuditModule,
    RbacModule,
    TypeOrmModule.forFeature([
      AuthCredentialEntity,
      AuthTokenEntity,
      AuthUserStateEntity,
      AuthSsoProviderEntity,
      AuthFederatedIdentityEntity,
      RefreshTokenEntity,
      UserEntity,
    ]),
  ],
  controllers: [AuthController, RolesController],
  providers: [
    AuthService,
    JwtTokenService,
    SecretsProviderService,
    JwtAuthGuard,
    TenantIsolationMiddleware,
  ],
  exports: [AuthService, JwtTokenService, JwtAuthGuard, RbacModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(TenantIsolationMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
