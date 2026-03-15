import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventEntity } from '../../event/src/entities/event.entity';
import { EarlyBirdRuleEntity } from './entities/early-bird-rule.entity';
import { PricingTierEntity } from './entities/pricing-tier.entity';
import { PromoCodeEntity } from './entities/promo-code.entity';
import { TicketEntitlementEntity } from './entities/ticket-entitlement.entity';
import { TicketProductEntity } from './entities/ticket-product.entity';
import { TicketEntity } from './entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      TicketProductEntity,
      TicketEntity,
      TicketEntitlementEntity,
      PricingTierEntity,
      PromoCodeEntity,
      EarlyBirdRuleEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class TicketingModule {}
