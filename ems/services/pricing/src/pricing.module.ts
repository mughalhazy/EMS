import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiscountRuleEntity } from './entities/discount-rule.entity';
import { PriceRuleEntity } from './entities/price-rule.entity';
import { PromoCodeEntity } from './entities/promo-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceRuleEntity, DiscountRuleEntity, PromoCodeEntity])],
  exports: [TypeOrmModule],
})
export class PricingModule {}
