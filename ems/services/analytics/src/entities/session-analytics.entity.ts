import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SessionEntity } from '../../../event/src/entities/session.entity';

@Entity({ name: 'session_analytics' })
@Index('idx_session_analytics_tenant_id', ['tenantId'])
@Index('idx_session_analytics_event_id', ['eventId'])
@Index('idx_session_analytics_session_id', ['sessionId'])
@Index('uq_session_analytics_session', ['tenantId', 'eventId', 'sessionId'], {
  unique: true,
})
@Check(
  'CK_session_analytics_non_negative',
  'registered_attendees >= 0 AND checked_in_attendees >= 0 AND no_show_attendees >= 0 AND total_engagement_actions >= 0',
)
@Check('CK_session_analytics_engagement_score_range', 'engagement_score >= 0 AND engagement_score <= 100')
export class SessionAnalyticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @ManyToOne(() => SessionEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: SessionEntity;

  @Column({ type: 'integer', name: 'registered_attendees', default: 0 })
  registeredAttendees!: number;

  @Column({ type: 'integer', name: 'checked_in_attendees', default: 0 })
  checkedInAttendees!: number;

  @Column({ type: 'integer', name: 'no_show_attendees', default: 0 })
  noShowAttendees!: number;

  @Column({ type: 'integer', name: 'poll_responses', default: 0 })
  pollResponses!: number;

  @Column({ type: 'integer', name: 'questions_asked', default: 0 })
  questionsAsked!: number;

  @Column({ type: 'integer', name: 'reactions', default: 0 })
  reactions!: number;

  @Column({ type: 'integer', name: 'total_engagement_actions', default: 0 })
  totalEngagementActions!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'engagement_score', default: 0 })
  engagementScore!: string;

  @Column({ type: 'timestamptz', name: 'last_attendance_at', nullable: true })
  lastAttendanceAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'last_engagement_at', nullable: true })
  lastEngagementAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
