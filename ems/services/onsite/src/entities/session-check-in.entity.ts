import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AttendeeEntity } from '../../../attendee/src/entities/attendee.entity';
import { SessionEntity } from '../../../agenda/src/entities/session.entity';
import { EventEntity } from '../../../event/src/entities/event.entity';

@Entity({ name: 'session_check_ins' })
@Index('idx_session_check_ins_attendee_id', ['attendeeId'])
@Index('idx_session_check_ins_session_id', ['sessionId'])
@Index('idx_session_check_ins_event_id', ['eventId'])
@Index('uq_session_check_ins_attendee_session', ['attendeeId', 'sessionId'], { unique: true })
export class SessionCheckInEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @ManyToOne(() => AttendeeEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_id' })
  attendee!: AttendeeEntity;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => SessionEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @Column({ type: 'varchar', length: 255, name: 'device_id' })
  deviceId!: string;

  @Column({ type: 'boolean', name: 'access_granted' })
  accessGranted!: boolean;

  @Column({ type: 'varchar', length: 255, name: 'denial_reason', nullable: true })
  denialReason!: string | null;

  @Column({ type: 'timestamptz', name: 'scanned_at' })
  scannedAt!: Date;
}
