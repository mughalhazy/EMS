import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SpeakerEntity } from '../../../speaker/src/entities/speaker.entity';
import { SessionEntity } from './session.entity';

@Entity({ name: 'session_speakers' })
@Index('uq_session_speakers_session_speaker', ['tenantId', 'sessionId', 'speakerId'], { unique: true })
@Index('idx_session_speakers_speaker_id', ['speakerId'])
export class SessionSpeakerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => SessionEntity, (session) => session.speakerAssignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @Column({ type: 'uuid', name: 'speaker_id' })
  speakerId!: string;

  @ManyToOne(() => SpeakerEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'speaker_id' })
  speaker!: SpeakerEntity;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
