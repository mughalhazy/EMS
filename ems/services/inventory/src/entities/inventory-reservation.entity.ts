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

import { InventoryPoolEntity } from './inventory-pool.entity';

export enum InventoryReservationStatus {
  Active = 'active',
  Confirmed = 'confirmed',
  Released = 'released',
  Expired = 'expired',
}

@Entity({ name: 'inventory_reservations' })
@Index('IDX_inventory_reservations_tenant_id', ['tenantId'])
@Index('IDX_inventory_reservations_pool_id', ['inventoryPoolId'])
@Index('IDX_inventory_reservations_status_expires_at', ['status', 'expiresAt'])
@Check('CK_inventory_reservations_quantity_positive', 'quantity > 0')
export class InventoryReservationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'inventory_pool_id' })
  inventoryPoolId!: string;

  @ManyToOne(() => InventoryPoolEntity, (inventoryPool) => inventoryPool.reservations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_pool_id' })
  inventoryPool!: InventoryPoolEntity;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({
    type: 'enum',
    enum: InventoryReservationStatus,
    default: InventoryReservationStatus.Active,
  })
  status!: InventoryReservationStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'reference_id' })
  referenceId!: string | null;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'released_at' })
  releasedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
