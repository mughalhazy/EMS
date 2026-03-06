import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventEntity } from './event.entity';

export enum SurveyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

@Entity({ name: 'surveys' })
@Index('uq_surveys_tenant_event_code', ['tenantId', 'eventId', 'code'], { unique: true })
@Index('idx_surveys_tenant_event_status', ['tenantId', 'eventId', 'status'])
export class SurveyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, (event) => event.surveys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event!: EventEntity;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: SurveyStatus, default: SurveyStatus.DRAFT })
  status!: SurveyStatus;

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
