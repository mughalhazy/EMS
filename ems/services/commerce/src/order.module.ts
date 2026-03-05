import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { InventoryEntity } from '../../ticketing/src/entities/inventory.entity';
import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { CheckoutController } from './checkout.controller';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { RedisLockService } from './redis-lock.service';
import { StripeCompatibleGateway } from './stripe-compatible.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, PaymentEntity, InventoryEntity])],
  controllers: [CheckoutController],
  providers: [OrderService, PaymentService, RedisLockService, StripeCompatibleGateway],
  exports: [OrderService, PaymentService, RedisLockService],
})
export class OrderModule {}
