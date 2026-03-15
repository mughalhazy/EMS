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

import { BoothEntity } from './booth.entity';
import { SponsorPackageEntity } from './sponsor-package.entity';
import { SponsorTier } from './sponsor-tier.enum';

@Entity({ name: 'exhibitors' })
@Index('idx_exhibitors_tenant_id', ['tenantId'])
@Index('idx_exhibitors_event_id', ['eventId'])
@Index('uq_exhibitors_event_name', ['eventId', 'name'], { unique: true })
export class ExhibitorEntity {
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

  @Column({
    type: 'enum',
    enum: SponsorTier,
    enumName: 'sponsor_tier',
    name: 'sponsorship_tier',
    nullable: true,
  })
  sponsorshipTier!: SponsorTier | null;

  @Column({ type: 'jsonb', name: 'contact_info', nullable: true })
  contactInfo!: Record<string, unknown> | null;

  @Column({ type: 'uuid', name: 'sponsor_package_id', nullable: true })
  sponsorPackageId!: string | null;

  @ManyToOne(() => SponsorPackageEntity, (sponsorPackage) => sponsorPackage.exhibitors, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sponsor_package_id' })
  sponsorPackage!: SponsorPackageEntity | null;

  @OneToMany(() => BoothEntity, (booth) => booth.exhibitor)
  booths!: BoothEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
