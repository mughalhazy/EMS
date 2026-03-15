import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AttendeeEntity } from './attendee.entity';

@Entity({ name: 'attendee_tags' })
@Index('idx_attendee_tags_tenant_id', ['tenantId'])
@Index('idx_attendee_tags_event_id', ['eventId'])
@Index('idx_attendee_tags_attendee_id', ['attendeeId'])
@Index('idx_attendee_tags_tag', ['tag'])
@Index('uq_attendee_tags_event_attendee_tag', ['eventId', 'attendeeId', 'tag'], { unique: true })
export class AttendeeTagEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @Column({ type: 'varchar', length: 64 })
  tag!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
