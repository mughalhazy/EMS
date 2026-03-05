import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryEntity } from '../../ticketing/src/entities/inventory.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { RedisLockService } from './redis-lock.service';
import { StripeCompatibleGateway } from './stripe-compatible.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, PaymentEntity, InventoryEntity])],
  providers: [OrderService, PaymentService, RedisLockService, StripeCompatibleGateway],
  exports: [OrderService, PaymentService, RedisLockService, StripeCompatibleGateway],
})
export class OrderModule {}
