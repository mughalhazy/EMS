import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '../../user/src';
import { AuthService } from './auth.service';
import { PermissionEntity } from './entities/permission.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { UserRoleAssignmentEntity } from './entities/user-role-assignment.entity';
import { JwtTokenService } from './jwt-token.service';
import { RbacService } from './rbac.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      UserRoleAssignmentEntity,
      RefreshTokenEntity,
    ]),
  ],
  providers: [AuthService, JwtTokenService, RbacService],
  exports: [AuthService, RbacService],
})
export class AuthModule {}
