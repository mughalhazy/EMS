import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TicketFulfillmentStatus {
  PENDING = 'pending',
  GENERATED = 'generated',
  ATTACHED = 'attached',
  REVOKED = 'revoked',
  FAILED = 'failed',
}

@Entity({ name: 'ticket_fulfillments' })
@Index('idx_ticket_fulfillments_tenant_order', ['tenantId', 'orderId'])
@Index('uq_ticket_fulfillments_order_item', ['orderItemId'], { unique: true })
export class TicketFulfillmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: string;

  @Column({ type: 'uuid', name: 'order_item_id' })
  orderItemId!: string;

  @Column({ type: 'varchar', length: 64, name: 'qr_code' })
  qrCode!: string;

  @Column({
    type: 'enum',
    enum: TicketFulfillmentStatus,
    default: TicketFulfillmentStatus.PENDING,
  })
  status!: TicketFulfillmentStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
