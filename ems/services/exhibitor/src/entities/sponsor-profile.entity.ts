import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SponsorTier } from './sponsor-tier.enum';

@Entity({ name: 'sponsor_profiles' })
@Index('idx_sponsor_profiles_tenant_id', ['tenantId'])
@Index('idx_sponsor_profiles_event_id', ['eventId'])
@Index('uq_sponsor_profiles_event_name', ['eventId', 'name'], { unique: true })
export class SponsorProfileEntity {
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

  @Column({ type: 'varchar', length: 2048, name: 'website_url', nullable: true })
  websiteUrl!: string | null;

  @Column({ type: 'varchar', length: 2048, name: 'logo_url', nullable: true })
  logoUrl!: string | null;

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

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
