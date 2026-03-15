import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { RegistrationEventsPublisher } from '../../registration/src/registration-events.publisher';
import { InventoryPoolEntity } from '../../inventory/src/entities/inventory-pool.entity';
import { UserEntity } from '../../user/src/entities/user.entity';
import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { TicketFulfillmentEntity } from './entities/ticket-fulfillment.entity';
import { CheckoutController } from './checkout.controller';
import { EmailConfirmationService } from './email-confirmation.service';
import { FulfillmentService } from './fulfillment.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { RedisLockService } from './redis-lock.service';
import { RateLimitService } from './rate-limit.service';
import { IdempotencyService } from './idempotency.service';
import { StripeCompatibleGateway } from './stripe-compatible.gateway';
import { TicketFulfillmentService } from './ticket-fulfillment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      PaymentEntity,
      TicketFulfillmentEntity,
      InventoryPoolEntity,
      UserEntity,
      RegistrationEntity,
    ]),
    AuditModule,
  ],
  controllers: [CheckoutController],
  providers: [
    OrderService,
    PaymentService,
    RedisLockService,
    RateLimitService,
    IdempotencyService,
    StripeCompatibleGateway,
    CommerceEventsPublisher,
    RegistrationEventsPublisher,
    TicketFulfillmentService,
    EmailConfirmationService,
    FulfillmentService,
  ],
  exports: [OrderService, PaymentService, RedisLockService, RateLimitService, IdempotencyService],
})
export class OrderModule {}
