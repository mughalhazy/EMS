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

import { EventEntity } from './event.entity';
import { SessionSpeakerEntity } from './session-speaker.entity';

export enum SpeakerStatus {
  INVITED = 'invited',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}

@Entity({ name: 'speakers' })
@Index('IDX_speakers_event_status', ['eventId', 'status'])
@Index('uq_speakers_event_email', ['eventId', 'email'], {
  unique: true,
  where: 'email IS NOT NULL',
})
export class SpeakerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, (event) => event.speakers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId!: string | null;

  @Column({ type: 'varchar', length: 120, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 120, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'enum', enum: SpeakerStatus, default: SpeakerStatus.INVITED })
  status!: SpeakerStatus;

  @OneToMany(() => SessionSpeakerEntity, (sessionSpeaker) => sessionSpeaker.speaker)
  sessionSpeakers!: SessionSpeakerEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
