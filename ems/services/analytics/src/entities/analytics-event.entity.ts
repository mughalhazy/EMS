import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'analytics', name: 'analytics_events' })
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ nullable: true }) eventId?: string;
  @Column() eventType: string;
  @Column({ type: 'jsonb' }) payload: Record<string, unknown>;
  @CreateDateColumn() occurredAt: Date;
}
