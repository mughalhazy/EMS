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

import { EventEntity } from './event.entity';
import { VenueEntity } from './venue.entity';

@Entity({ name: 'rooms' })
@Index('uq_rooms_venue_name', ['venueId', 'name'], { unique: true })
@Check('CK_rooms_capacity_non_negative', 'capacity >= 0')
export class RoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, (event) => event.rooms, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'venue_id' })
  venueId!: string;

  @ManyToOne(() => VenueEntity, (venue) => venue.rooms, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venue_id' })
  venue!: VenueEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor!: string | null;

  @Column({ type: 'int' })
  capacity!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
