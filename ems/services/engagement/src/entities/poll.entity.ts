import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SessionEntity } from '../../../agenda/src/entities/session.entity';

export enum PollStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

@Entity({ name: 'polls' })
@Index('idx_polls_tenant_id', ['tenantId'])
@Index('idx_polls_event_id', ['eventId'])
@Index('idx_polls_session_id', ['sessionId'])
@Check('CK_polls_schedule_window', 'starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at')
export class PollEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => SessionEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @Column({ type: 'varchar', length: 255 })
  question!: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  options!: string[];

  @Column({ type: 'enum', enum: PollStatus, default: PollStatus.DRAFT })
  status!: PollStatus;

  @Column({ type: 'timestamptz', name: 'starts_at', nullable: true })
  startsAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'ends_at', nullable: true })
  endsAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
