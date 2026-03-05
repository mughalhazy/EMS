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

import { TicketEntity } from './ticket.entity';

@Entity({ name: 'ticket_pricing_tiers' })
@Index('idx_ticket_pricing_tiers_ticket_id', ['ticketId'])
@Check('ck_ticket_pricing_tiers_min_quantity_positive', '"min_quantity" >= 1')
@Check('ck_ticket_pricing_tiers_max_quantity_valid', '"max_quantity" IS NULL OR "max_quantity" >= "min_quantity"')
@Check('ck_ticket_pricing_tiers_unit_price_non_negative', '"unit_price" >= 0')
export class PricingTierEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'ticket_id' })
  ticketId!: string;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.pricingTiers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @Column({ type: 'integer', name: 'min_quantity', default: 1 })
  minQuantity!: number;

  @Column({ type: 'integer', name: 'max_quantity', nullable: true })
  maxQuantity!: number | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'unit_price' })
  unitPrice!: string;

  @Column({ type: 'timestamptz', name: 'starts_at', nullable: true })
  startsAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'ends_at', nullable: true })
  endsAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
