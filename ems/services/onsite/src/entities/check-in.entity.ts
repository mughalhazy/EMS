import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AttendeeEntity } from '../../../attendee/src/entities/attendee.entity';
import { EventEntity } from '../../../event/src/entities/event.entity';

@Entity({ name: 'check_ins' })
@Index('idx_check_ins_attendee_id', ['attendeeId'])
@Index('idx_check_ins_event_id', ['eventId'])
export class CheckInEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @ManyToOne(() => AttendeeEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_id' })
  attendee!: AttendeeEntity;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'timestamptz', name: 'checked_in_at' })
  checkedInAt!: Date;

  @Column({ type: 'varchar', length: 255, name: 'device_id' })
  deviceId!: string;
}
