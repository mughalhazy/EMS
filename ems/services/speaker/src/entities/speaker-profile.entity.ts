import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SpeakerEntity } from './speaker.entity';

@Entity({ name: 'speaker_profiles' })
@Index('idx_speaker_profiles_tenant_id', ['tenantId'])
@Index('idx_speaker_profiles_event_id', ['eventId'])
@Index('uq_speaker_profiles_speaker_id', ['speakerId'], { unique: true })
export class SpeakerProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'speaker_id' })
  speakerId!: string;

  @OneToOne(() => SpeakerEntity, (speaker) => speaker.profile, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'speaker_id' })
  speaker!: SpeakerEntity;

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

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
