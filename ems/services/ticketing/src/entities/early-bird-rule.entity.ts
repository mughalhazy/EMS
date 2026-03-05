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

import { DiscountType } from './pricing-rule.types';
import { TicketEntity } from './ticket.entity';

@Entity({ name: 'ticket_early_bird_rules' })
@Index('idx_ticket_early_bird_rules_ticket_id', ['ticketId'])
@Check('ck_ticket_early_bird_rules_discount_value_non_negative', '"discount_value" >= 0')
@Check(
  'ck_ticket_early_bird_rules_window',
  '"starts_at" IS NULL OR "ends_at" IS NULL OR "starts_at" < "ends_at"',
)
@Check(
  'ck_ticket_early_bird_rules_max_redemptions_non_negative',
  '"max_redemptions" IS NULL OR "max_redemptions" >= 0',
)
export class EarlyBirdRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId!: string;

  @Column({ type: 'uuid', name: 'ticket_id' })
  ticketId!: string;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.earlyBirdRules, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: TicketEntity;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    enumName: 'ticket_discount_type',
    name: 'discount_type',
  })
  discountType!: DiscountType;

  @Column({ type: 'numeric', precision: 12, scale: 2, name: 'discount_value' })
  discountValue!: string;

  @Column({ type: 'timestamptz', name: 'starts_at', nullable: true })
  startsAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'ends_at', nullable: true })
  endsAt!: Date | null;

  @Column({ type: 'integer', name: 'max_redemptions', nullable: true })
  maxRedemptions!: number | null;

  @Column({ type: 'integer', name: 'redeemed_count', default: 0 })
  redeemedCount!: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
