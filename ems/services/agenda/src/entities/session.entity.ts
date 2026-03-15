import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventEntity } from '../../../event/src/entities/event.entity';
import { RoomEntity } from '../../../event/src/entities/room.entity';
import { AttendeeScheduleEntity } from './attendee-schedule.entity';
import { SessionSpeakerEntity } from './session-speaker.entity';
import { SessionQnaEntity } from './session-qna.entity';
import { TrackEntity } from './track.entity';

export enum SessionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'sessions' })
@Index('idx_sessions_tenant_id', ['tenantId'])
@Index('idx_sessions_event_id', ['eventId'])
@Index('idx_sessions_room_id', ['roomId'])
@Index('idx_sessions_track_id', ['trackId'])
@Index('idx_sessions_event_agenda_order', ['eventId', 'agendaOrder'])
@Check('CK_sessions_capacity_non_negative', 'capacity >= 0')
@Check('CK_sessions_remaining_seats_non_negative', 'remaining_seats >= 0')
@Check('CK_sessions_remaining_seats_within_capacity', 'remaining_seats <= capacity')
@Check('CK_sessions_time_range', 'end_time > start_time')
@Check('CK_sessions_agenda_order_positive', 'agenda_order > 0')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'room_id' })
  roomId!: string;

  @ManyToOne(() => RoomEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'room_id' })
  room!: RoomEntity;

  @Column({ type: 'uuid', name: 'track_id', nullable: true })
  trackId!: string | null;

  @ManyToOne(() => TrackEntity, (track) => track.sessions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'track_id' })
  track!: TrackEntity | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz', name: 'start_time' })
  startTime!: Date;

  @Column({ type: 'timestamptz', name: 'end_time' })
  endTime!: Date;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'int', name: 'remaining_seats' })
  remainingSeats!: number;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.DRAFT })
  status!: SessionStatus;

  @Column({ type: 'int', name: 'agenda_order' })
  agendaOrder!: number;

  @OneToMany(() => SessionSpeakerEntity, (sessionSpeaker) => sessionSpeaker.session)
  speakerAssignments!: SessionSpeakerEntity[];

  @OneToMany(() => AttendeeScheduleEntity, (attendeeSchedule) => attendeeSchedule.session)
  attendeeSchedules!: AttendeeScheduleEntity[];

  @OneToMany(() => SessionQnaEntity, (qnaEntry) => qnaEntry.session)
  qnaEntries!: SessionQnaEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
