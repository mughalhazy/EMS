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

import { EventEntity } from '../../../event/src/entities/event.entity';

@Entity({ name: 'event_analytics' })
@Index('idx_event_analytics_tenant_id', ['tenantId'])
@Index('idx_event_analytics_event_id', ['eventId'])
@Index('idx_event_analytics_snapshot_date', ['snapshotDate'])
@Index('uq_event_analytics_tenant_event_snapshot', ['tenantId', 'eventId', 'snapshotDate'], {
  unique: true,
})
export class EventAnalyticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'date', name: 'snapshot_date' })
  snapshotDate!: string;

  @Column({ type: 'int', name: 'registrations_count', default: 0 })
  registrationsCount!: number;

  @Column({ type: 'int', name: 'tickets_sold_count', default: 0 })
  ticketsSoldCount!: number;

  @Column({ type: 'numeric', precision: 14, scale: 2, name: 'ticket_sales_amount', default: 0 })
  ticketSalesAmount!: string;

  @Column({ type: 'int', name: 'attendees_checked_in_count', default: 0 })
  attendeesCheckedInCount!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
