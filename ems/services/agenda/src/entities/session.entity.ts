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

import { EventEntity } from '../../../event/src/entities/event.entity';
import { RoomEntity } from '../../../event/src/entities/room.entity';
import { SpeakerEntity } from './speaker.entity';

@Entity({ name: 'sessions' })
@Index('idx_sessions_tenant_id', ['tenantId'])
@Index('idx_sessions_event_id', ['eventId'])
@Index('idx_sessions_room_id', ['roomId'])
@Index('idx_sessions_speaker_id', ['speakerId'])
@Check('CK_sessions_capacity_non_negative', 'capacity >= 0')
@Check('CK_sessions_remaining_seats_non_negative', 'remaining_seats >= 0')
@Check('CK_sessions_remaining_seats_within_capacity', 'remaining_seats <= capacity')
@Check('CK_sessions_time_range', 'end_time > start_time')
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

  @Column({ type: 'uuid', name: 'speaker_id' })
  speakerId!: string;

  @ManyToOne(() => SpeakerEntity, (speaker) => speaker.sessions, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'speaker_id' })
  speaker!: SpeakerEntity;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'timestamptz', name: 'start_time' })
  startTime!: Date;

  @Column({ type: 'timestamptz', name: 'end_time' })
  endTime!: Date;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'int', name: 'remaining_seats' })
  remainingSeats!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
