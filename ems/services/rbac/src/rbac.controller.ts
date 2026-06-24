import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ok,
  JwtAuthGuard,
  CurrentUser,
  JwtPayload,
  RequirePermissions,
  PermissionsGuard,
} from '@ems/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get()
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'List roles for the current tenant' })
  async list(@CurrentUser() user: JwtPayload) {
    return ok(await this.rbacService.listRoles(user.tenantId));
  }

  @Post()
  @RequirePermissions('role:write')
  @ApiOperation({ summary: 'Create a custom role' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateRoleDto) {
    return ok(await this.rbacService.createRole(user.tenantId, dto));
  }

  @Delete(':id')
  @RequirePermissions('role:write')
  @ApiOperation({ summary: 'Delete a custom role' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.rbacService.deleteRole(id, user.tenantId);
    return ok({ deleted: true });
  }
}

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserRoleController {
  constructor(private readonly rbacService: RbacService) {}

  @Get(':userId/roles')
  @RequirePermissions('role:read')
  @ApiOperation({ summary: 'List roles assigned to a user' })
  async listUserRoles(@Param('userId') userId: string, @CurrentUser() user: JwtPayload) {
    return ok(await this.rbacService.listUserRoles(userId, user.tenantId));
  }

  @Post(':userId/roles')
  @RequirePermissions('role:assign')
  @ApiOperation({ summary: 'Assign a role to a user' })
  async assignRole(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AssignRoleDto,
  ) {
    return ok(await this.rbacService.assignRole(userId, user.tenantId, dto));
  }

  @Delete(':userId/roles/:roleId')
  @RequirePermissions('role:revoke')
  @ApiOperation({ summary: 'Revoke a role from a user' })
  async revokeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.rbacService.revokeRole(userId, roleId, user.tenantId);
    return ok({ revoked: true });
  }
}
