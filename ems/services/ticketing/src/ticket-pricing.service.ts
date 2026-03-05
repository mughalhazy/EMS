import { DiscountType } from './entities/pricing-rule.types';
import { TicketEntity } from './entities/ticket.entity';

export interface PricingRequest {
  quantity: number;
  purchaseDate?: Date;
  promoCode?: string;
}

export interface PricingResult {
  unitPrice: number;
  subtotal: number;
  discount: number;
  total: number;
  appliedRules: string[];
}

export class TicketPricingService {
  calculate(ticket: Pick<TicketEntity, 'totalPrice' | 'pricingTiers' | 'earlyBirdRules' | 'promoCodes'>, input: PricingRequest): PricingResult {
    const quantity = Math.max(1, input.quantity);
    const now = input.purchaseDate ?? new Date();
    let unitPrice = Number(ticket.totalPrice);
    const appliedRules: string[] = [];

    const tier = [...(ticket.pricingTiers ?? [])]
      .filter((rule) => rule.isActive && quantity >= rule.minQuantity)
      .sort((a, b) => b.minQuantity - a.minQuantity)[0];

    if (tier) {
      unitPrice = Number(tier.price);
      appliedRules.push(`tier:${tier.name}`);
    }

    const earlyBird = (ticket.earlyBirdRules ?? []).find(
      (rule) =>
        rule.isActive &&
        (rule.startsAt === null || now >= rule.startsAt) &&
        (rule.endsAt === null || now <= rule.endsAt) &&
        (rule.maxRedemptions === null || rule.redeemedCount < rule.maxRedemptions),
    );

    if (earlyBird) {
      unitPrice = this.applyDiscount(unitPrice, earlyBird.discountType, Number(earlyBird.discountValue));
      appliedRules.push(`earlyBird:${earlyBird.name}`);
    }

    const promo = (ticket.promoCodes ?? []).find(
      (rule) =>
        input.promoCode &&
        rule.code.toLowerCase() === input.promoCode.toLowerCase() &&
        rule.isActive &&
        quantity >= rule.minQuantity &&
        (rule.startsAt === null || now >= rule.startsAt) &&
        (rule.endsAt === null || now <= rule.endsAt) &&
        (rule.maxRedemptions === null || rule.redeemedCount < rule.maxRedemptions),
    );

    if (promo) {
      unitPrice = this.applyDiscount(unitPrice, promo.discountType, Number(promo.discountValue));
      appliedRules.push(`promo:${promo.code}`);
    }

    const subtotal = Number((Number(ticket.totalPrice) * quantity).toFixed(2));
    const total = Number((unitPrice * quantity).toFixed(2));
    const discount = Number((subtotal - total).toFixed(2));

    return {
      unitPrice: Number(unitPrice.toFixed(2)),
      subtotal,
      discount,
      total,
      appliedRules,
    };
  }

  private applyDiscount(base: number, type: DiscountType, discountValue: number): number {
    if (type === DiscountType.PERCENTAGE) {
      return Math.max(0, base - (base * discountValue) / 100);
    }

    return Math.max(0, base - discountValue);
  }
}
