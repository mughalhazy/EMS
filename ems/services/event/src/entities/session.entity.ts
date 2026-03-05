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

import { EventEntity } from './event.entity';
import { RoomEntity } from './room.entity';
import { SessionSpeakerEntity } from './session-speaker.entity';

export enum SessionType {
  KEYNOTE = 'keynote',
  TALK = 'talk',
  PANEL = 'panel',
  WORKSHOP = 'workshop',
  NETWORKING = 'networking',
  OTHER = 'other',
}

export enum SessionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'sessions' })
@Index('IDX_sessions_event_start_at', ['eventId', 'startAt'])
@Check('CK_sessions_time_window', 'start_at < end_at')
@Check('CK_sessions_capacity_non_negative', 'capacity IS NULL OR capacity >= 0')
@Check('CK_sessions_remaining_seats_non_negative', 'remaining_seats IS NULL OR remaining_seats >= 0')
@Check(
  'CK_sessions_remaining_seats_within_capacity',
  '(capacity IS NULL AND remaining_seats IS NULL) OR (capacity IS NOT NULL AND remaining_seats IS NOT NULL AND remaining_seats <= capacity)',
)
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, (event) => event.sessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'room_id', nullable: true })
  roomId!: string | null;

  @ManyToOne(() => RoomEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'room_id' })
  room!: RoomEntity | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  abstract!: string | null;

  @Column({ type: 'enum', enum: SessionType, name: 'session_type' })
  sessionType!: SessionType;

  @Column({ type: 'timestamptz', name: 'start_at' })
  startAt!: Date;

  @Column({ type: 'timestamptz', name: 'end_at' })
  endAt!: Date;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column({ type: 'int', name: 'remaining_seats', nullable: true })
  remainingSeats!: number | null;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.DRAFT })
  status!: SessionStatus;

  @OneToMany(() => SessionSpeakerEntity, (sessionSpeaker) => sessionSpeaker.session)
  sessionSpeakers!: SessionSpeakerEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
