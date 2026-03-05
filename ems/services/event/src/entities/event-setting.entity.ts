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

import { EventEntity } from './event.entity';

export enum EventVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
}

@Entity({ name: 'event_settings' })
@Index('UQ_event_settings_tenant_event', ['tenantId', 'eventId'], { unique: true })
export class EventSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @OneToOne(() => EventEntity)
  @JoinColumn({ name: 'event_id', referencedColumnName: 'id' })
  event!: EventEntity;

  @Column({ type: 'varchar', length: 64 })
  timezone!: string;

  @Column({ type: 'integer', nullable: true })
  capacity!: number | null;

  @Column({ type: 'enum', enum: EventVisibility, default: EventVisibility.PRIVATE })
  visibility!: EventVisibility;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
