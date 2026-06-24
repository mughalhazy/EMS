import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

const PLATFORM_PERMISSIONS = [
  { code: 'user:read', description: 'Read user profiles' },
  { code: 'user:write', description: 'Create and update users' },
  { code: 'user:delete', description: 'Delete or deactivate users' },
  { code: 'tenant:read', description: 'Read tenant details' },
  { code: 'tenant:write', description: 'Update tenant settings' },
  { code: 'tenant:suspend', description: 'Suspend a tenant' },
  { code: 'sso:manage', description: 'Manage tenant SSO connections (OAuth2/SAML)' },
  { code: 'role:read', description: 'Read roles and permissions' },
  { code: 'role:write', description: 'Create and update roles' },
  { code: 'role:assign', description: 'Assign roles to users' },
  { code: 'role:revoke', description: 'Revoke roles from users' },
  { code: 'audit:read', description: 'Read audit logs' },
];

const DEFAULT_ROLES: Record<string, string[]> = {
  tenant_admin: [
    'user:read',
    'user:write',
    'user:delete',
    'tenant:read',
    'tenant:write',
    'sso:manage',
    'role:read',
    'role:write',
    'role:assign',
    'role:revoke',
    'audit:read',
  ],
  organizer: ['user:read', 'role:read'],
  finance: ['audit:read'],
  support: ['user:read', 'audit:read'],
  exhibitor: [],
  speaker: [],
  onsite_staff: [],
  attendee: [],
};

@Injectable()
export class RbacService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(Permission) private readonly permissions: Repository<Permission>,
    @InjectRepository(UserRole) private readonly userRoles: Repository<UserRole>,
    private readonly eventBus: EventBusService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedPermissions();
    await this.eventBus.subscribe(
      'rbac-service',
      ['user.registered', 'tenant.created'],
      async (event) => {
        const { eventType, tenantId, payload } = event as unknown as {
          eventType: string;
          tenantId: string;
          payload: { userId?: string };
        };
        if (eventType === 'tenant.created') await this.seedDefaultRoles(tenantId);
        if (eventType === 'user.registered' && payload.userId) {
          await this.assignDefaultAttendeeRole(payload.userId, tenantId);
        }
      },
    );
  }

  private async seedPermissions() {
    for (const p of PLATFORM_PERMISSIONS) {
      const exists = await this.permissions.findOne({ where: { code: p.code } });
      if (!exists) await this.permissions.save(this.permissions.create(p));
    }
  }

  private async seedDefaultRoles(tenantId: string) {
    const allPerms = await this.permissions.find();
    const permMap = new Map(allPerms.map((p) => [p.code, p]));
    for (const [name, codes] of Object.entries(DEFAULT_ROLES)) {
      const exists = await this.roles.findOne({ where: { tenantId, name } });
      if (exists) continue;
      const rolePerms = codes.map((c) => permMap.get(c)).filter((p): p is Permission => !!p);
      const role = this.roles.create({ tenantId, name, isSystem: true, permissions: rolePerms });
      await this.roles.save(role);
    }
  }

  private async assignDefaultAttendeeRole(userId: string, tenantId: string) {
    const attendeeRole = await this.roles.findOne({ where: { tenantId, name: 'attendee' } });
    if (!attendeeRole) return;
    const existing = await this.userRoles.findOne({
      where: { userId, roleId: attendeeRole.id, tenantId },
    });
    if (!existing) {
      await this.userRoles.save(
        this.userRoles.create({ userId, roleId: attendeeRole.id, tenantId }),
      );
    }
  }

  async getUserPermissions(userId: string, tenantId: string): Promise<string[]> {
    const assignments = await this.userRoles.find({ where: { userId, tenantId } });
    if (!assignments.length) return [];
    const roleIds = assignments.map((a) => a.roleId);
    const userRoleEntities = await this.roles.find({ where: { id: In(roleIds) } });
    const codes = new Set<string>();
    for (const role of userRoleEntities) {
      for (const p of role.permissions ?? []) codes.add(p.code);
    }
    return Array.from(codes);
  }

  async getUserRoleNames(userId: string, tenantId: string): Promise<string[]> {
    const assignments = await this.userRoles.find({ where: { userId, tenantId } });
    if (!assignments.length) return [];
    const roleIds = assignments.map((a) => a.roleId);
    const userRoleEntities = await this.roles.find({ where: { id: In(roleIds) } });
    return userRoleEntities.map((r) => r.name);
  }

  async listRoles(tenantId: string) {
    return this.roles.find({ where: [{ tenantId }, { tenantId: undefined }] });
  }

  async createRole(tenantId: string, dto: CreateRoleDto) {
    const perms = dto.permissionCodes?.length
      ? await this.permissions.find({ where: { code: In(dto.permissionCodes) } })
      : [];
    const role = this.roles.create({ tenantId, name: dto.name, permissions: perms });
    return this.roles.save(role);
  }

  async deleteRole(id: string, tenantId: string) {
    const role = await this.roles.findOne({ where: { id, tenantId } });
    if (!role) throw new NotFoundException('Role not found');
    await this.roles.remove(role);
  }

  async assignRole(userId: string, tenantId: string, dto: AssignRoleDto) {
    const role = await this.roles.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');
    const existing = await this.userRoles.findOne({
      where: { userId, roleId: dto.roleId, tenantId },
    });
    if (existing) return existing;
    const userRole = this.userRoles.create({ userId, roleId: dto.roleId, tenantId });
    await this.userRoles.save(userRole);

    await this.eventBus.publish('role.assigned', {
      eventType: 'role.assigned',
      tenantId,
      payload: { userId, roleId: dto.roleId },
    });

    return userRole;
  }

  async revokeRole(userId: string, roleId: string, tenantId: string) {
    const userRole = await this.userRoles.findOne({ where: { userId, roleId, tenantId } });
    if (!userRole) throw new NotFoundException('Role assignment not found');
    await this.userRoles.remove(userRole);

    await this.eventBus.publish('role.revoked', {
      eventType: 'role.revoked',
      tenantId,
      payload: { userId, roleId },
    });
  }

  async listUserRoles(userId: string, tenantId: string) {
    const assignments = await this.userRoles.find({ where: { userId, tenantId } });
    if (!assignments.length) return [];
    const roleIds = assignments.map((a) => a.roleId);
    return this.roles.find({ where: { id: In(roleIds) } });
  }
}
