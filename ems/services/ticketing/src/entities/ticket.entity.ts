import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EventEntity } from '../../../event/src/entities/event.entity';
import { EarlyBirdRuleEntity } from './early-bird-rule.entity';
import { InventoryEntity } from './inventory.entity';
import { PricingTierEntity } from './pricing-tier.entity';
import { PromoCodeEntity } from './promo-code.entity';
import { TicketEntitlementEntity } from './ticket-entitlement.entity';
import { TicketProductEntity } from './ticket-product.entity';

@Entity({ name: 'tickets' })
@Index('idx_tickets_event_id', ['eventId'])
@Index('idx_tickets_inventory_id', ['inventoryId'])
@Index('idx_tickets_ticket_product_id', ['ticketProductId'])
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'uuid', name: 'inventory_id' })
  inventoryId!: string;

  @Column({ type: 'uuid', name: 'ticket_product_id', nullable: true })
  ticketProductId!: string | null;

  @ManyToOne(() => TicketProductEntity, (ticketProduct) => ticketProduct.tickets, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ticket_product_id' })
  ticketProduct!: TicketProductEntity | null;


  @ManyToOne(() => InventoryEntity, (inventory) => inventory.tickets, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'inventory_id' })
  inventory!: InventoryEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'char', length: 3 })
  currency!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'base_price' })
  basePrice!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'fee_amount', default: 0 })
  feeAmount!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'tax_amount', default: 0 })
  taxAmount!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'total_price' })
  totalPrice!: string;

  @OneToMany(() => PricingTierEntity, (pricingTier) => pricingTier.ticket)
  pricingTiers!: PricingTierEntity[];

  @OneToMany(() => EarlyBirdRuleEntity, (earlyBirdRule) => earlyBirdRule.ticket)
  earlyBirdRules!: EarlyBirdRuleEntity[];

  @OneToMany(() => PromoCodeEntity, (promoCode) => promoCode.ticket)
  promoCodes!: PromoCodeEntity[];

  @OneToMany(() => TicketEntitlementEntity, (entitlement) => entitlement.ticket)
  entitlements!: TicketEntitlementEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
