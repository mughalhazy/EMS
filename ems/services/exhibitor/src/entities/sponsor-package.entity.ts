import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

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
