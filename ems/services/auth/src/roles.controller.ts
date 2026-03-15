import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { AuditService } from '../../audit/src/audit.service';
import { RequirePermissions } from './decorators/require-permissions.decorator';
import { ApiDataResponseDto } from './dto/api-response.dto';
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
  async listRoles(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Awaited<ReturnType<RbacService['listRoles']>>>> {
    const roles = await this.rbacService.listRoles(tenantId);
    return this.successResponse(roles, request);
  }

  @Post()
  @RequirePermissions('roles.manage')
  async createRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: CreateRoleDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Awaited<ReturnType<RbacService['createRole']>>>> {
    const role = await this.rbacService.createRole({ tenantId, ...payload });
    await this.auditService.trackRoleChange({
      tenantId,
      action: 'role.created',
      targetUserId: null,
      after: { roleId: role.id, name: role.name },
    });
    return this.successResponse(role, request);
  }

  @Patch(':roleId/permissions')
  @RequirePermissions('roles.manage')
  async updateRolePermissions(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() payload: UpdateRolePermissionsDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Awaited<ReturnType<RbacService['setRolePermissions']>>>> {
    const role = await this.rbacService.setRolePermissions(tenantId, roleId, payload.permissionIds);
    await this.auditService.trackRoleChange({
      tenantId,
      action: 'role.permissions.updated',
      after: { roleId, permissionIds: payload.permissionIds },
    });
    return this.successResponse(role, request);
  }

  @Post(':roleId/assignments')
  @RequirePermissions('roles.assign')
  async assignRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @Body() payload: AssignRoleDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Awaited<ReturnType<RbacService['assignRoleToUser']>>>> {
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

    return this.successResponse(assignment, request);
  }

  @Get('permissions/catalog')
  @RequirePermissions('roles.read')
  async listPermissions(
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Awaited<ReturnType<RbacService['listPermissions']>>>> {
    const permissions = await this.rbacService.listPermissions();
    return this.successResponse(permissions, request);
  }

  @Post('permissions/catalog')
  @RequirePermissions('roles.manage')
  async createPermission(
    @Body() payload: CreatePermissionDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Awaited<ReturnType<RbacService['createPermission']>>>> {
    const permission = await this.rbacService.createPermission(payload);
    return this.successResponse(permission, request);
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
