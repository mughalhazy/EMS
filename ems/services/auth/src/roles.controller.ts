import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { AuditService } from '../../audit/src/audit.service';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RbacGuard } from './guards/rbac.guard';
import { RbacService } from './rbac.service';

@Controller('api/v1/tenants/:tenantId/roles')
@UseGuards(JwtAuthGuard, RbacGuard)
export class RolesController {
  constructor(
    private readonly rbacService: RbacService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @RequirePermissions('roles.read')
  async listRoles(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.rbacService.listRoles(tenantId);
  }

  @Post()
  @RequirePermissions('roles.manage')
  async createRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: CreateRoleDto,
  ) {
    const role = await this.rbacService.createRole({ tenantId, ...payload });
    await this.auditService.trackRoleChange({
      tenantId,
      action: 'role.created',
      targetUserId: null,
      after: { roleId: role.id, name: role.name },
    });
    return role;
  }

  @Patch(':roleId/permissions')
  @RequirePermissions('roles.manage')
  async updateRolePermissions(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() payload: UpdateRolePermissionsDto,
  ) {
    const role = await this.rbacService.setRolePermissions(tenantId, roleId, payload.permissionIds);
    await this.auditService.trackRoleChange({
      tenantId,
      action: 'role.permissions.updated',
      after: { roleId, permissionIds: payload.permissionIds },
    });
    return role;
  }

  @Post(':roleId/assignments')
  @RequirePermissions('roles.assign')
  async assignRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() payload: AssignRoleDto,
  ) {
    const assignment = await this.rbacService.assignRoleToUser({
      tenantId,
      roleId,
      userId: payload.userId,
      scopeType: payload.scopeType ?? null,
      scopeId: payload.scopeId ?? null,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    });

    await this.auditService.trackRoleChange({
      tenantId,
      targetUserId: payload.userId,
      action: 'role.assigned',
      after: { roleId, assignmentId: assignment.id },
    });

    return assignment;
  }

  @Get('permissions/catalog')
  @RequirePermissions('roles.read')
  async listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Post('permissions/catalog')
  @RequirePermissions('roles.manage')
  async createPermission(@Body() payload: CreatePermissionDto) {
    return this.rbacService.createPermission(payload);
  }
}
