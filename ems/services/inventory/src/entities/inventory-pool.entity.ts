import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { InventoryReservationEntity } from './inventory-reservation.entity';

@Entity({ name: 'inventory_pools' })
@Index('IDX_inventory_pools_tenant_id', ['tenantId'])
@Unique('UQ_inventory_pools_tenant_name', ['tenantId', 'name'])
@Check('CK_inventory_pools_capacity_non_negative', 'capacity >= 0')
@Check('CK_inventory_pools_reserved_non_negative', 'reserved_quantity >= 0')
@Check('CK_inventory_pools_reserved_not_exceed_capacity', 'reserved_quantity <= capacity')
export class InventoryPoolEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'integer', default: 0 })
  capacity!: number;

  @Column({ type: 'integer', default: 0, name: 'reserved_quantity' })
  reservedQuantity!: number;

  @OneToMany(() => InventoryReservationEntity, (reservation) => reservation.inventoryPool)
  reservations!: InventoryReservationEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
