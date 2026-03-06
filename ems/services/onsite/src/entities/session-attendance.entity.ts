import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AttendeeEntity } from '../../../attendee/src/entities/attendee.entity';
import { SessionEntity } from '../../../event/src/entities/session.entity';

@Entity({ name: 'session_attendance' })
@Index('idx_session_attendance_attendee_id', ['attendeeId'])
@Index('idx_session_attendance_session_id', ['sessionId'])
@Index('uq_session_attendance_attendee_session', ['attendeeId', 'sessionId'], {
  unique: true,
})
export class SessionAttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({ type: 'timestamptz', name: 'scanned_at' })
  scannedAt!: Date;
}
