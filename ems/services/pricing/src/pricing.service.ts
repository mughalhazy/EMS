import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { PromoCode } from './entities/promo-code.entity';
import { CreatePromoCodeDto } from './dto/pricing.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PromoCode) private readonly codes: Repository<PromoCode>,
    private readonly eventBus: EventBusService,
  ) {}

  async createPromoCode(tenantId: string, dto: CreatePromoCodeDto) {
    const existing = await this.codes.findOne({
      where: { tenantId, eventId: dto.eventId, code: dto.code },
    });
    if (existing) throw new ConflictException('Promo code already exists for this event');
    const promo = this.codes.create({
      tenantId,
      eventId: dto.eventId,
      code: dto.code,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxUses: dto.maxUses,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      active: dto.active ?? true,
    });
    return this.codes.save(promo);
  }

  async validateCode(code: string, eventId: string, tenantId: string): Promise<PromoCode | null> {
    const promo = await this.codes.findOne({ where: { tenantId, eventId, code, active: true } });
    if (!promo) return null;
    if (promo.expiresAt && promo.expiresAt < new Date()) return null;
    if (promo.maxUses !== undefined && promo.maxUses !== null && promo.usedCount >= promo.maxUses)
      return null;
    return promo;
  }

  async applyCode(promoCodeId: string, tenantId: string, subtotalCents: number): Promise<number> {
    const promo = await this.codes.findOne({ where: { id: promoCodeId, tenantId } });
    if (!promo) throw new NotFoundException('Promo code not found');

    let discount = 0;
    if (promo.discountType === 'percent') {
      discount = Math.round((subtotalCents * promo.discountValue) / 100);
    } else {
      discount = Math.min(promo.discountValue, subtotalCents);
    }

    promo.usedCount += 1;
    await this.codes.save(promo);
    await this.eventBus.publish('promo_code.redeemed', {
      eventType: 'promo_code.redeemed',
      tenantId,
      payload: { promoCodeId, code: promo.code, eventId: promo.eventId, discountCents: discount },
    });
    return discount;
  }

  async listCodes(tenantId: string, eventId: string) {
    return this.codes.find({ where: { tenantId, eventId }, order: { createdAt: 'DESC' } });
  }

  async deactivateCode(id: string, tenantId: string) {
    const promo = await this.codes.findOne({ where: { id, tenantId } });
    if (!promo) throw new NotFoundException('Promo code not found');
    promo.active = false;
    return this.codes.save(promo);
  }
}
