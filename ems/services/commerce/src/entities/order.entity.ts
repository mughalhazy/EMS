import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderItemEntity } from './order-item.entity';

export enum OrderStatus {
  DRAFT = 'draft',
  PLACED = 'placed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

export interface OrderInventoryReservation {
  inventoryId: string;
  quantity: number;
}

export type OrderInventoryReservations = OrderInventoryReservation[];

@Entity({ name: 'orders' })
@Index('idx_orders_tenant_status', ['tenantId', 'status'])
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  status!: OrderStatus;

  @Column({ type: 'jsonb' })
  totals!: OrderTotals;

  @Column({ type: 'jsonb', nullable: true })
  reservation!: OrderInventoryReservations | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  items!: OrderItemEntity[];
}
