import {
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
import { UserEntity } from '../../../user/src/entities/user.entity';
import { AttendeeTagEntity } from './attendee-tag.entity';

export enum AttendeeStatus {
  PROSPECT = 'prospect',
  REGISTERED = 'registered',
  CHECKED_IN = 'checked_in',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'attendees' })
@Index('idx_attendees_tenant_id', ['tenantId'])
@Index('idx_attendees_event_id', ['eventId'])
@Index('idx_attendees_user_id', ['userId'])
@Index('uq_attendees_event_email', ['eventId', 'email'], { unique: true })
export class AttendeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity | null;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 120, name: 'badge_name', nullable: true })
  badgeName!: string | null;

  @Column({
    type: 'enum',
    enum: AttendeeStatus,
    default: AttendeeStatus.REGISTERED,
  })
  status!: AttendeeStatus;

  @OneToMany(() => AttendeeTagEntity, (attendeeTag) => attendeeTag.attendee)
  tags!: AttendeeTagEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
