import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'engagement_questions' })
@Index('idx_engagement_questions_tenant_event', ['tenantId', 'eventId'])
@Index('idx_engagement_questions_session_id', ['sessionId'])
@Index('idx_engagement_questions_attendee_id', ['attendeeId'])
export class EngagementQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'text' })
  question!: string;

  @Column({ type: 'uuid', name: 'attendee_id' })
  attendeeId!: string;

  @Column({ type: 'uuid', name: 'session_id' })
  sessionId!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
