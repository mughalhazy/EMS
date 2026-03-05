import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserRoleAssignmentEntity } from './user-role-assignment.entity';
import { RolePermissionEntity } from './role-permission.entity';

export enum RoleScope {
  TENANT = 'tenant',
  ORGANIZATION = 'organization',
  EVENT = 'event',
}

@Entity({ name: 'roles' })
@Index('uq_roles_tenant_name', ['tenantId', 'name'], { unique: true })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'enum', enum: RoleScope, default: RoleScope.TENANT })
  scope!: RoleScope;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem!: boolean;

  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.role)
  permissions!: RolePermissionEntity[];

  @OneToMany(() => UserRoleAssignmentEntity, (assignment) => assignment.role)
  assignments!: UserRoleAssignmentEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
