import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { InventoryHoldEntity } from './inventory-hold.entity';
import { TicketEntity } from './ticket.entity';

@Entity({ name: 'inventory_items' })
@Check('CK_inventory_total_quantity_non_negative', 'total_quantity >= 0')
@Check('CK_inventory_reserved_quantity_non_negative', 'reserved_quantity >= 0')
@Check('CK_inventory_reserved_not_exceed_total', 'reserved_quantity <= total_quantity')
export class InventoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'integer', default: 0, name: 'total_quantity' })
  totalQuantity!: number;

  @Column({ type: 'integer', default: 0, name: 'reserved_quantity' })
  reservedQuantity!: number;

  @OneToMany(() => TicketEntity, (ticket) => ticket.inventory)
  tickets!: TicketEntity[];

  @OneToMany(() => InventoryHoldEntity, (hold) => hold.inventory)
  holds!: InventoryHoldEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
