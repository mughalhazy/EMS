import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditDomain {
  AUTH = 'auth',
  ROLE = 'role',
  TENANT = 'tenant',
  EVENT = 'event',
  COMMERCE = 'commerce',
  REGISTRATION = 'registration',
  ONSITE = 'onsite',
}

export enum AuditCategory {
  USER_ACTION = 'user_action',
  ENTITY_CHANGE = 'entity_change',
  SECURITY_EVENT = 'security_event',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

@Entity({ name: 'audit_logs' })
@Check('ck_audit_logs_domain', "domain IN ('auth', 'role', 'tenant', 'event', 'commerce', 'registration', 'onsite')")
@Check('ck_audit_logs_category', "category IN ('user_action', 'entity_change', 'security_event')")
@Check('ck_audit_logs_severity', "severity IN ('info', 'warning', 'critical')")
@Index('idx_audit_logs_tenant_domain_created', ['tenantId', 'domain', 'createdAt'])
@Index('idx_audit_logs_tenant_category_created', ['tenantId', 'category', 'createdAt'])
@Index('idx_audit_logs_actor_created', ['actorUserId', 'createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'actor_user_id', nullable: true })
  actorUserId!: string | null;

  @Column({ type: 'uuid', name: 'target_user_id', nullable: true })
  targetUserId!: string | null;

  @Column({ type: 'varchar', length: 32 })
  domain!: AuditDomain;

  @Column({ type: 'varchar', length: 32, default: AuditCategory.USER_ACTION })
  category!: AuditCategory;

  @Column({ type: 'varchar', length: 32, default: AuditSeverity.INFO })
  severity!: AuditSeverity;

  @Column({ type: 'varchar', length: 128 })
  action!: string;

  @Column({ type: 'varchar', name: 'entity_type', length: 64, nullable: true })
  entityType!: string | null;

  @Column({ type: 'uuid', name: 'entity_id', nullable: true })
  entityId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  before!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
