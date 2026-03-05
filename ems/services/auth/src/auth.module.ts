import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../user/src/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt-token.service';
import { TenantIsolationMiddleware } from './middleware/tenant-isolation.middleware';
import { RbacService } from './rbac.service';
import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { AuthFederatedIdentityEntity } from './entities/auth-federated-identity.entity';
import { AuthSsoProviderEntity } from './entities/auth-sso-provider.entity';
import { AuthTokenEntity } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';
import { PermissionEntity } from './entities/permission.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRoleAssignmentEntity } from './entities/user-role-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthCredentialEntity,
      AuthTokenEntity,
      AuthUserStateEntity,
      AuthSsoProviderEntity,
      AuthFederatedIdentityEntity,
      RefreshTokenEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      UserRoleAssignmentEntity,
      UserEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtTokenService, RbacService, TenantIsolationMiddleware],
  exports: [AuthService, JwtTokenService, RbacService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantIsolationMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
