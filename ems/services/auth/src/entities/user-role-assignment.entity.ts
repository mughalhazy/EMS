import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { RoleEntity } from './role.entity';

@Entity({ name: 'user_role_assignments' })
@Check(
  'ck_user_role_assignments_scope_pair',
  '((scope_type IS NULL AND scope_id IS NULL) OR (scope_type IS NOT NULL AND scope_id IS NOT NULL))',
)
@Check(
  'ck_user_role_assignments_scope_type',
  '(scope_type IS NULL OR scope_type IN (\'tenant\', \'organization\', \'event\'))',
)
@Index(
  'uq_user_role_assignments_active',
  ['tenantId', 'userId', 'roleId', 'scopeType', 'scopeId', 'revokedAt'],
  { unique: true },
)
export class UserRoleAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId!: string;

  @ManyToOne(() => RoleEntity, (role) => role.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ type: 'varchar', length: 32, name: 'scope_type', nullable: true })
  scopeType!: 'tenant' | 'organization' | 'event' | null;

  @Column({ type: 'uuid', name: 'scope_id', nullable: true })
  scopeId!: string | null;

  @Column({ type: 'uuid', name: 'assigned_by', nullable: true })
  assignedBy!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ type: 'timestamptz', name: 'expires_at', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'revoked_at', nullable: true })
  revokedAt!: Date | null;
}
