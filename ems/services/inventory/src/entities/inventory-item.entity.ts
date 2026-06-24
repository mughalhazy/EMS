import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'inventory', name: 'inventory_items' })
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) ticketProductId: string;
  @Column() tenantId: string;
  @Column() eventId: string;
  @Column({ type: 'integer' }) totalQty: number;
  @Column({ type: 'integer', default: 0 }) reservedQty: number;
  @Column({ type: 'integer', default: 0 }) soldQty: number;
  @UpdateDateColumn() updatedAt: Date;
}
