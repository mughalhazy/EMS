import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventEntity } from '../../../event/src/entities/event.entity';
import { Tenant } from '../../../tenant/src/tenant.entity';
import { ExhibitorEntity } from './exhibitor.entity';

@Entity({ name: 'sponsor_packages' })
@Index('idx_sponsor_packages_tenant_id', ['tenantId'])
@Index('idx_sponsor_packages_event_id', ['eventId'])
@Index('uq_sponsor_packages_event_name', ['eventId', 'name'], { unique: true })
export class SponsorPackageEntity {
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

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  price!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  benefits!: Record<string, unknown> | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => ExhibitorEntity, (exhibitor) => exhibitor.sponsorPackage)
  exhibitors!: ExhibitorEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
