import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditModule } from '../../audit/src/audit.module';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { InventoryEntity } from '../../ticketing/src/entities/inventory.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { UserEntity } from '../../user/src/entities/user.entity';
import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { TicketFulfillmentEntity } from './entities/ticket-fulfillment.entity';
import { CheckoutController } from './checkout.controller';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { RedisLockService } from './redis-lock.service';
import { StripeCompatibleGateway } from './stripe-compatible.gateway';
import { TicketFulfillmentService } from './ticket-fulfillment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderItemEntity,
      PaymentEntity,
      TicketFulfillmentEntity,
      InventoryEntity,
      TicketEntity,
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
    StripeCompatibleGateway,
    CommerceEventsPublisher,
    TicketFulfillmentService,
  ],
  exports: [OrderService, PaymentService, RedisLockService],
})
export class OrderModule {}
