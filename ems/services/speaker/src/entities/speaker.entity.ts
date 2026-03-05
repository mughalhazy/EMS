import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SpeakerStatus {
  INVITED = 'invited',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn',
}

@Entity({ name: 'speakers' })
@Index('idx_speakers_tenant_id', ['tenantId'])
@Index('idx_speakers_event_id', ['eventId'])
@Index('idx_speakers_status', ['status'])
@Index('uq_speakers_event_email', ['eventId', 'email'], {
  unique: true,
  where: 'email IS NOT NULL',
})
export class SpeakerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId!: string | null;

  @Column({ type: 'varchar', length: 120, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 120, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  headline!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true, name: 'company_name' })
  companyName!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'photo_url' })
  photoUrl!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'website_url' })
  websiteUrl!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'linkedin_url' })
  linkedinUrl!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'x_url' })
  xUrl!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'github_url' })
  githubUrl!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'location_label' })
  locationLabel!: string | null;

  @Column({ type: 'text', array: true, default: '{}', name: 'expertise_tags' })
  expertiseTags!: string[];

  @Column({ type: 'enum', enum: SpeakerStatus, default: SpeakerStatus.INVITED })
  status!: SpeakerStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
