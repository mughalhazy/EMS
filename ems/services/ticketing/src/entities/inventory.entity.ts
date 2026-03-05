import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TicketEntity } from './ticket.entity';

@Entity({ name: 'inventory_items' })
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

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
