import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { UserEntity } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';
import { SecretsProviderService } from './secrets-provider.service';
import { TenantIsolationMiddleware } from './middleware/tenant-isolation.middleware';
import { RbacModule } from './rbac.module';
import { RolesController } from './roles.controller';
import { UserCredentialEntity } from './entities/user-credential.entity';
import { AuthFederatedIdentityEntity } from './entities/auth-federated-identity.entity';
import { AuthSsoProviderEntity } from './entities/auth-sso-provider.entity';
import { AuthTokenEntity } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';
import { PermissionEntity } from './entities/permission.entity';
import { AuthSessionEntity } from './entities/auth-session.entity';
import { RoleEntity } from './entities/role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserRoleAssignmentEntity } from './entities/user-role-assignment.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    AuditModule,
    RbacModule,
    TypeOrmModule.forFeature([
      UserCredentialEntity,
      AuthTokenEntity,
      AuthUserStateEntity,
      AuthSsoProviderEntity,
      AuthFederatedIdentityEntity,
      AuthSessionEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      UserRoleAssignmentEntity,
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
        { path: 'api/v1/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
