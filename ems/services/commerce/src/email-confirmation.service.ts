import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderItemEntity } from './entities/order-item.entity';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class EmailConfirmationService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    private readonly commerceEventsPublisher: CommerceEventsPublisher,
  ) {}

  async sendForPayment(payment: PaymentEntity): Promise<void> {
    const orderItems = await this.orderItemRepository.find({
      where: { tenantId: payment.tenantId, orderId: payment.orderId },
    });

    const recipientEmails = Array.from(
      new Set(
        orderItems
          .flatMap((item) => item.attendees ?? [])
          .map((attendee) => attendee.email?.trim().toLowerCase())
          .filter((email): email is string => Boolean(email)),
      ),
    );

    if (!recipientEmails.length) {
      return;
    }

    await this.commerceEventsPublisher.publishOrderConfirmationEmailRequested({
      tenantId: payment.tenantId,
      orderId: payment.orderId,
      paymentId: payment.id,
      recipientEmails,
    });
  }
}
