import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { TenantIsolationMiddleware } from './middleware/tenant-isolation.middleware';
import { RbacService } from './rbac.service';
import { AuthCredentialEntity } from './entities/auth-credential.entity';
import { AuthFederatedIdentityEntity } from './entities/auth-federated-identity.entity';
import { AuthSsoProviderEntity } from './entities/auth-sso-provider.entity';
import { AuthTokenEntity } from './entities/auth-token.entity';
import { AuthUserStateEntity } from './entities/auth-user-state.entity';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserRoleAssignmentEntity } from './entities/user-role-assignment.entity';
import { UserEntity } from '../../user/src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthCredentialEntity,
      AuthTokenEntity,
      AuthUserStateEntity,
      AuthSsoProviderEntity,
      AuthFederatedIdentityEntity,
      UserEntity,
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      UserRoleAssignmentEntity,
    ]),
  ],
  providers: [AuthService, RbacService, TenantIsolationMiddleware],
  exports: [AuthService, RbacService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantIsolationMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
