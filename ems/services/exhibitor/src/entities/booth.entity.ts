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

import { ExhibitorEntity } from './exhibitor.entity';

@Entity({ name: 'booths' })
@Index('idx_booths_tenant_id', ['tenantId'])
@Index('idx_booths_event_id', ['eventId'])
@Index('idx_booths_exhibitor_id', ['exhibitorId'])
@Index('idx_booths_venue_id', ['venueId'])
@Index('uq_booths_venue_location', ['venueId', 'locationCode'], { unique: true })
@Check('CK_booths_capacity_non_negative', 'capacity >= 0')
export class BoothEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'exhibitor_id' })
  exhibitorId!: string;

  @ManyToOne(() => ExhibitorEntity, (exhibitor) => exhibitor.booths, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exhibitor_id' })
  exhibitor!: ExhibitorEntity;

  @Column({ type: 'uuid', name: 'venue_id' })
  venueId!: string;

  @Column({ type: 'varchar', length: 64, name: 'location_code' })
  locationCode!: string;

  @Column({ type: 'varchar', length: 255, name: 'location_label' })
  locationLabel!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
