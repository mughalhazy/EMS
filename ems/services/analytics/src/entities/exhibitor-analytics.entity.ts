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

import { EventEntity } from '../../../event/src/entities/event.entity';
import { Tenant } from '../../../tenant/src/tenant.entity';
import { BoothEntity } from '../../../exhibitor/src/entities/booth.entity';
import { ExhibitorEntity } from '../../../exhibitor/src/entities/exhibitor.entity';

@Entity({ name: 'exhibitor_analytics' })
@Index('idx_exhibitor_analytics_tenant_id', ['tenantId'])
@Index('idx_exhibitor_analytics_event_id', ['eventId'])
@Index('idx_exhibitor_analytics_exhibitor_id', ['exhibitorId'])
@Index('idx_exhibitor_analytics_booth_id', ['boothId'])
@Index('uq_exhibitor_analytics_booth_metric_date', ['boothId', 'metricDate'], {
  unique: true,
})
@Check(
  'CK_exhibitor_analytics_non_negative_counts',
  'lead_captures_count >= 0 AND booth_visits_count >= 0',
)
export class ExhibitorAnalyticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @ManyToOne(() => Tenant, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: Tenant;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'exhibitor_id' })
  exhibitorId!: string;

  @ManyToOne(() => ExhibitorEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exhibitor_id' })
  exhibitor!: ExhibitorEntity;

  @Column({ type: 'uuid', name: 'booth_id' })
  boothId!: string;

  @ManyToOne(() => BoothEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booth_id' })
  booth!: BoothEntity;

  @Column({ type: 'date', name: 'metric_date' })
  metricDate!: string;

  @Column({ type: 'integer', name: 'lead_captures_count', default: 0 })
  leadCapturesCount!: number;

  @Column({ type: 'integer', name: 'booth_visits_count', default: 0 })
  boothVisitsCount!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
