import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


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

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  interests!: string[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
