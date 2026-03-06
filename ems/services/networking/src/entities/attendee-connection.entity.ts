import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AttendeeEntity } from '../../../attendee/src/entities/attendee.entity';

export enum AttendeeConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  BLOCKED = 'blocked',
}

@Entity({ name: 'attendee_connections' })
@Index('uq_attendee_connections_tenant_event_pair', ['tenantId', 'eventId', 'attendeeAId', 'attendeeBId'], {
  unique: true,
})
@Index('idx_attendee_connections_tenant_event', ['tenantId', 'eventId'])
@Index('idx_attendee_connections_attendee_a', ['attendeeAId'])
@Index('idx_attendee_connections_attendee_b', ['attendeeBId'])
export class AttendeeConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'attendee_a_id' })
  attendeeAId!: string;

  @ManyToOne(() => AttendeeEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_a_id' })
  attendeeA!: AttendeeEntity;

  @Column({ type: 'uuid', name: 'attendee_b_id' })
  attendeeBId!: string;

  @ManyToOne(() => AttendeeEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendee_b_id' })
  attendeeB!: AttendeeEntity;

  @Column({
    type: 'enum',
    enum: AttendeeConnectionStatus,
    default: AttendeeConnectionStatus.PENDING,
  })
  status!: AttendeeConnectionStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
