import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserRoleAssignmentEntity } from './entities/user-role-assignment.entity';
import { RbacGuard } from './guards/rbac.guard';
import { RbacService } from './rbac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      PermissionEntity,
      RolePermissionEntity,
      UserRoleAssignmentEntity,
    ]),
  ],
  providers: [RbacService, RbacGuard],
  exports: [RbacService, RbacGuard],
})
export class RbacModule {}
