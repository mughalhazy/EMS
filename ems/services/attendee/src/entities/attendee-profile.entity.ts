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

import { EventEntity } from '../../../event/src/entities/event.entity';
import { UserEntity } from '../../../user/src/entities/user.entity';

@Entity({ name: 'attendee_profiles' })
@Index('idx_attendee_profiles_tenant_id', ['tenantId'])
@Index('idx_attendee_profiles_event_id', ['eventId'])
@Index('idx_attendee_profiles_user_id', ['userId'])
@Index('uq_attendee_profiles_event_user', ['eventId', 'userId'], { unique: true })
export class AttendeeProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  interests!: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
