import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserRoleAssignmentEntity } from './entities/user-role-assignment.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly userRoleAssignmentRepository: Repository<UserRoleAssignmentEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
  ) {}

  async getUserRbac(tenantId: string, userId: string): Promise<{ roles: string[]; permissions: string[] }> {
    const now = new Date();
    const assignments = await this.userRoleAssignmentRepository.find({
      where: {
        tenantId,
        userId,
        revokedAt: null,
      },
      relations: {
        role: true,
      },
    });

    const activeAssignments = assignments.filter(
      (assignment) => !assignment.expiresAt || assignment.expiresAt > now,
    );
    const roleIds = activeAssignments.map((assignment) => assignment.roleId);
    const roles = activeAssignments.map((assignment) => assignment.role.name);

    if (!roleIds.length) {
      return { roles: [], permissions: [] };
    }

    const rolePermissions = await this.rolePermissionRepository.find({
      where: roleIds.map((roleId) => ({ roleId })),
      relations: {
        permission: true,
      },
    });

    const permissions = [...new Set(rolePermissions.map((row) => row.permission.code))];
    return {
      roles: [...new Set(roles)],
      permissions,
    };
  }

  async userHasPermission(tenantId: string, userId: string, permissionCode: string): Promise<boolean> {
    const { permissions } = await this.getUserRbac(tenantId, userId);
    return permissions.includes(permissionCode);
  }
}
