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

import { InventoryEntity } from './inventory.entity';

export enum InventoryHoldStatus {
  Active = 'active',
  Confirmed = 'confirmed',
  Released = 'released',
  Expired = 'expired',
}

@Entity({ name: 'inventory_holds' })
@Index('idx_inventory_holds_inventory_id', ['inventoryId'])
@Index('idx_inventory_holds_status_expires_at', ['status', 'expiresAt'])
@Check('CK_inventory_holds_quantity_positive', 'quantity > 0')
export class InventoryHoldEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'inventory_id' })
  inventoryId!: string;

  @ManyToOne(() => InventoryEntity, (inventory) => inventory.holds, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory!: InventoryEntity;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({
    type: 'enum',
    enum: InventoryHoldStatus,
    default: InventoryHoldStatus.Active,
  })
  status!: InventoryHoldStatus;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'released_at' })
  releasedAt!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'reference_id' })
  referenceId!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
