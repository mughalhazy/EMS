import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BoothEntity } from './booth.entity';

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

  @Column({ type: 'varchar', length: 180 })
  name!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'website_url' })
  websiteUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => BoothEntity, (booth) => booth.exhibitor)
  booths!: BoothEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
