import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SessionEntity } from './session.entity';
import { SpeakerEntity } from './speaker.entity';

@Entity({ name: 'session_speakers' })
@Index('uq_session_speakers_session_speaker', ['sessionId', 'speakerId'], { unique: true })
@Index('IDX_session_speakers_speaker', ['speakerId'])
export class SessionSpeakerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => SessionEntity, (session) => session.sessionSpeakers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @Column({ type: 'uuid', name: 'speaker_id' })
  speakerId!: string;

  @ManyToOne(() => SpeakerEntity, (speaker) => speaker.sessionSpeakers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'speaker_id' })
  speaker!: SpeakerEntity;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
