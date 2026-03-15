import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { PermissionEntity } from './entities/permission.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity, RoleScope } from './entities/role.entity';
import { UserRoleAssignmentEntity } from './entities/user-role-assignment.entity';

export interface CreatePermissionInput {
  resource: string;
  action: string;
  code: string;
  description?: string | null;
}

export interface CreateRoleInput {
  tenantId: string;
  name: string;
  scope?: RoleScope;
  description?: string | null;
  isSystem?: boolean;
  permissionIds?: string[];
}

export interface AssignRoleToUserInput {
  tenantId: string;
  roleId: string;
  userId: string;
  scopeType?: 'tenant' | 'organization' | 'event' | null;
  scopeId?: string | null;
  expiresAt?: Date | null;
  assignedBy?: string | null;
}

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(UserRoleAssignmentEntity)
    private readonly userRoleAssignmentRepository: Repository<UserRoleAssignmentEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async createPermission(input: CreatePermissionInput): Promise<PermissionEntity> {
    const permission = this.permissionRepository.create({
      resource: input.resource,
      action: input.action,
      code: input.code,
      description: input.description ?? null,
    });

    return this.permissionRepository.save(permission);
  }

  async listPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepository.find({
      order: {
        resource: 'ASC',
        action: 'ASC',
      },
    });
  }

  async createRole(input: CreateRoleInput): Promise<RoleEntity> {
    const role = await this.roleRepository.save(
      this.roleRepository.create({
        tenantId: input.tenantId,
        name: input.name,
        scope: input.scope ?? RoleScope.TENANT,
        description: input.description ?? null,
        isSystem: input.isSystem ?? false,
      }),
    );

    if (input.permissionIds?.length) {
      await this.setRolePermissions(input.tenantId, role.id, input.permissionIds);
    }

    return this.getRoleById(input.tenantId, role.id);
  }

  async listRoles(tenantId: string): Promise<RoleEntity[]> {
    return this.roleRepository.find({
      where: { tenantId },
      relations: {
        permissions: {
          permission: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async setRolePermissions(
    tenantId: string,
    roleId: string,
    permissionIds: string[],
  ): Promise<RoleEntity> {
    const role = await this.requireTenantRole(tenantId, roleId);

    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length) {
      const permissions = await this.permissionRepository.findBy({ id: uniquePermissionIds as string[] });
      if (permissions.length !== uniquePermissionIds.length) {
        throw new NotFoundException('One or more permissions were not found');
      }
    }

    await this.rolePermissionRepository.delete({ roleId: role.id });

    if (uniquePermissionIds.length) {
      await this.rolePermissionRepository.save(
        uniquePermissionIds.map((permissionId) =>
          this.rolePermissionRepository.create({
            roleId: role.id,
            permissionId,
          }),
        ),
      );
    }

    return this.getRoleById(tenantId, role.id);
  }

  async assignRoleToUser(input: AssignRoleToUserInput): Promise<UserRoleAssignmentEntity> {
    const role = await this.requireTenantRole(input.tenantId, input.roleId);
    this.validateScope(input.scopeType ?? null, input.scopeId ?? null);

    const existing = await this.userRoleAssignmentRepository.findOne({
      where: {
        tenantId: input.tenantId,
        userId: input.userId,
        roleId: input.roleId,
        scopeType: input.scopeType ?? null,
        scopeId: input.scopeId ?? null,
        revokedAt: IsNull(),
      },
    });

    if (existing) {
      existing.expiresAt = input.expiresAt ?? null;
      existing.assignedBy = input.assignedBy ?? existing.assignedBy ?? null;
      return this.userRoleAssignmentRepository.save(existing);
    }

    return this.userRoleAssignmentRepository.save(
      this.userRoleAssignmentRepository.create({
        tenantId: input.tenantId,
        userId: input.userId,
        roleId: role.id,
        scopeType: input.scopeType ?? null,
        scopeId: input.scopeId ?? null,
        expiresAt: input.expiresAt ?? null,
        assignedBy: input.assignedBy ?? null,
        revokedAt: null,
      }),
    );
  }

  async revokeRoleAssignment(tenantId: string, assignmentId: string): Promise<void> {
    const assignment = await this.userRoleAssignmentRepository.findOne({
      where: {
        id: assignmentId,
        tenantId,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Role assignment not found');
    }

    assignment.revokedAt = new Date();
    await this.userRoleAssignmentRepository.save(assignment);
  }

  async getUserRbac(tenantId: string, userId: string): Promise<{ roles: string[]; permissions: string[] }> {
    const now = new Date();
    const assignments = await this.userRoleAssignmentRepository.find({
      where: {
        tenantId,
        userId,
        revokedAt: IsNull(),
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

    const rolePermissions = await this.rolePermissionRepository
      .createQueryBuilder('rolePermission')
      .innerJoinAndSelect('rolePermission.permission', 'permission')
      .innerJoin(RoleEntity, 'role', 'role.id = rolePermission.role_id')
      .where('rolePermission.role_id IN (:...roleIds)', { roleIds })
      .andWhere('role.tenant_id = :tenantId', { tenantId })
      .getMany();

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

  async userHasPermissions(
    tenantId: string,
    userId: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    if (!requiredPermissions.length) {
      return true;
    }

    const { permissions } = await this.getUserRbac(tenantId, userId);
    return requiredPermissions.every((permission) => permissions.includes(permission));
  }

  private validateScope(scopeType: string | null, scopeId: string | null): void {
    if ((!scopeType && scopeId) || (scopeType && !scopeId)) {
      throw new BadRequestException('scopeType and scopeId must be provided together');
    }
  }

  private async requireTenantRole(tenantId: string, roleId: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
        tenantId,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  private async getRoleById(tenantId: string, roleId: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId, tenantId },
      relations: {
        permissions: {
          permission: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }
}
