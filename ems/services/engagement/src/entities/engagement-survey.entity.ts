import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EngagementSurveyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

@Entity({ name: 'engagement_surveys' })
@Index('uq_engagement_surveys_tenant_event_code', ['tenantId', 'eventId', 'code'], { unique: true })
@Index('idx_engagement_surveys_tenant_event_status', ['tenantId', 'eventId', 'status'])
export class EngagementSurveyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: EngagementSurveyStatus, default: EngagementSurveyStatus.DRAFT })
  status!: EngagementSurveyStatus;

  @Column({ type: 'boolean', name: 'is_anonymous', default: true })
  isAnonymous!: boolean;

  @Column({ type: 'timestamptz', name: 'open_at', nullable: true })
  openAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'close_at', nullable: true })
  closeAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  questions!: Array<Record<string, unknown>> | null;

  @Column({ type: 'jsonb', nullable: true })
  settings!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
