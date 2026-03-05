import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OrderEntity } from './order.entity';

export interface OrderItemAttendee {
  firstName?: string;
  lastName?: string;
  email?: string;
  isTicketOwner?: boolean;
  answers?: Array<{
    questionId: string;
    value: string;
  }>;
}

@Entity({ name: 'order_items' })
@Index('idx_order_items_order_id', ['orderId'])
@Index('idx_order_items_tenant_order', ['tenantId', 'orderId'])
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: string;

  @Column({ type: 'uuid', name: 'inventory_id' })
  inventoryId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'unit_price' })
  unitPrice!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'total_price' })
  totalPrice!: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  attendees!: OrderItemAttendee[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity;
}
