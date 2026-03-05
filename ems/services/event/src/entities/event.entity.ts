import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoomEntity } from './room.entity';
import { RegistrationQuestionEntity } from './registration-question.entity';
import { VenueEntity } from './venue.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  LIVE = 'live',
  ARCHIVED = 'archived',
}

@Entity({ name: 'events' })
@Index('uq_events_tenant_code', ['tenantId', 'code'], { unique: true })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 64 })
  timezone!: string;

  @Column({ type: 'timestamptz', name: 'start_at' })
  startAt!: Date;

  @Column({ type: 'timestamptz', name: 'end_at' })
  endAt!: Date;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.DRAFT })
  status!: EventStatus;

  @Column({ type: 'jsonb', nullable: true })
  agenda!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  settings!: Record<string, unknown> | null;

  @OneToMany(() => VenueEntity, (venue) => venue.event)
  venues!: VenueEntity[];

  @OneToMany(() => RoomEntity, (room) => room.event)
  rooms!: RoomEntity[];

  @OneToMany(() => RegistrationQuestionEntity, (registrationQuestion) => registrationQuestion.event)
  registrationQuestions!: RegistrationQuestionEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
