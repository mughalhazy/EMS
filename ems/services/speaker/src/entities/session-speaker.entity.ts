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

import { SpeakerEntity } from './speaker.entity';

@Entity({ name: 'session_speakers' })
@Index('idx_session_speakers_tenant_id', ['tenantId'])
@Index('idx_session_speakers_event_id', ['eventId'])
@Index('idx_session_speakers_session_id', ['sessionId'])
@Index('idx_session_speakers_speaker_id', ['speakerId'])
@Index('uq_session_speakers_session_speaker', ['tenantId', 'sessionId', 'speakerId'], { unique: true })
export class SessionSpeakerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @Column({ type: 'uuid', name: 'speaker_id' })
  speakerId!: string;

  @ManyToOne(() => SpeakerEntity, (speaker) => speaker.sessionAssignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'speaker_id' })
  speaker!: SpeakerEntity;

  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder!: number;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
