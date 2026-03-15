import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { SessionEntity } from './session.entity';

@Entity({ name: 'tracks' })
@Index('idx_tracks_tenant_id', ['tenantId'])
@Index('idx_tracks_event_id', ['eventId'])
@Index('uq_tracks_event_name', ['eventId', 'name'], { unique: true })
@Check('CK_tracks_display_order_positive', 'display_order > 0')
export class TrackEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true, name: 'color_code' })
  colorCode!: string | null;

  @Column({ type: 'int', name: 'display_order' })
  displayOrder!: number;

  @OneToMany(() => SessionEntity, (session) => session.track)
  sessions!: SessionEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
