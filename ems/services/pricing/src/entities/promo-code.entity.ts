import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DiscountType } from './pricing-rule.types';

@Entity({ name: 'pricing_promo_codes' })
@Index('idx_pricing_promo_codes_tenant_event', ['tenantId', 'eventId'])
@Index('uq_pricing_promo_codes_tenant_event_code', ['tenantId', 'eventId', 'code'], { unique: true })
@Check('ck_pricing_promo_codes_value_non_negative', '"value" >= 0')
@Check('ck_pricing_promo_codes_min_quantity_positive', '"min_quantity" >= 1')
@Check(
  'ck_pricing_promo_codes_validity_window',
  '"active_from" IS NULL OR "active_to" IS NULL OR "active_from" < "active_to"',
)
@Check('ck_pricing_promo_codes_max_redemptions_non_negative', '"max_redemptions" IS NULL OR "max_redemptions" >= 0')
export class PromoCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'ticket_product_id', nullable: true })
  ticketProductId!: string | null;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    enumName: 'pricing_discount_type',
    name: 'discount_type',
  })
  discountType!: DiscountType;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  value!: string;

  @Column({ type: 'integer', name: 'min_quantity', default: 1 })
  minQuantity!: number;

  @Column({ type: 'integer', name: 'max_redemptions', nullable: true })
  maxRedemptions!: number | null;

  @Column({ type: 'integer', name: 'redeemed_count', default: 0 })
  redeemedCount!: number;

  @Column({ type: 'timestamptz', name: 'active_from', nullable: true })
  activeFrom!: Date | null;

  @Column({ type: 'timestamptz', name: 'active_to', nullable: true })
  activeTo!: Date | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
