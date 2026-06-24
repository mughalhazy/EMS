import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity({ schema: 'analytics', name: 'event_metrics' })
@Unique(['tenantId', 'eventId'])
export class EventMetric {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column({ type: 'int', default: 0 }) registrationsCount: number;
  @Column({ type: 'int', default: 0 }) checkInsCount: number;
  @Column({ type: 'int', default: 0 }) ticketsIssuedCount: number;
  @Column({ type: 'int', default: 0 }) ticketsRedeemedCount: number;
  @Column({ type: 'int', default: 0 }) ordersCount: number;
  @Column({ type: 'int', default: 0 }) revenueCents: number;
  @Column({ type: 'int', default: 0 }) surveyResponsesCount: number;
  @UpdateDateColumn() updatedAt: Date;
}
