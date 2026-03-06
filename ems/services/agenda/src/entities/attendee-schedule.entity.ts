import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AttendeeEntity } from '../../../attendee/src/entities/attendee.entity';
import { SessionEntity } from './session.entity';

@Entity({ name: 'attendee_schedules' })
@Index('uq_attendee_schedules_attendee_session', ['tenantId', 'eventId', 'attendeeId', 'sessionId'], { unique: true })
@Index('idx_attendee_schedules_session_id', ['sessionId'])
@Index('idx_attendee_schedules_attendee_id', ['attendeeId'])
export class AttendeeScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @ManyToOne(() => AttendeeEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_id' })
  attendee!: AttendeeEntity;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => SessionEntity, (session) => session.attendeeSchedules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
