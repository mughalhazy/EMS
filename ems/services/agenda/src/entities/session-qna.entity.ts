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

@Entity({ name: 'session_qna' })
@Index('idx_session_qna_session_id', ['sessionId'])
@Index('idx_session_qna_attendee_id', ['attendeeId'])
export class SessionQnaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => SessionEntity, (session) => session.qnaEntries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
