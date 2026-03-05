import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventEntity } from './event.entity';
import { RoomEntity } from './room.entity';

export enum VenueType {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual',
  HYBRID = 'hybrid',
}

@Entity({ name: 'venues' })
@Check(
  'CK_venues_type_requirements',
  `(
    (type = 'physical' AND address_line1 IS NOT NULL AND city IS NOT NULL AND country IS NOT NULL)
    OR (type = 'virtual' AND virtual_url IS NOT NULL)
    OR (type = 'hybrid' AND address_line1 IS NOT NULL AND city IS NOT NULL AND country IS NOT NULL AND virtual_url IS NOT NULL)
  )`,
)
@Check('CK_venues_capacity_non_negative', 'capacity IS NULL OR capacity >= 0')
export class VenueEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, (event) => event.venues, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'enum', enum: VenueType })
  type!: VenueType;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'address_line1' })
  addressLine1!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true, name: 'virtual_url' })
  virtualUrl!: string | null;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @OneToMany(() => RoomEntity, (room) => room.venue)
  rooms!: RoomEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
