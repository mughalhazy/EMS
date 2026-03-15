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

@Entity({ name: 'discount_rules' })
@Index('idx_discount_rules_tenant_ticket', ['tenantId', 'ticketProductId'])
@Index('idx_discount_rules_tenant_event', ['tenantId', 'eventId'])
@Check('ck_discount_rules_value_non_negative', '"value" >= 0')
@Check('ck_discount_rules_validity_window', '"active_from" IS NULL OR "active_to" IS NULL OR "active_from" < "active_to"')
export class DiscountRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'uuid', name: 'ticket_product_id' })
  ticketProductId!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    enumName: 'pricing_discount_type',
    name: 'discount_type',
  })
  discountType!: DiscountType;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  value!: string;

  @Column({ type: 'integer', default: 0 })
  priority!: number;

  @Column({ type: 'timestamptz', name: 'active_from', nullable: true })
  activeFrom!: Date | null;

  @Column({ type: 'timestamptz', name: 'active_to', nullable: true })
  activeTo!: Date | null;

  @Column({ type: 'boolean', name: 'is_stackable', default: false })
  isStackable!: boolean;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
