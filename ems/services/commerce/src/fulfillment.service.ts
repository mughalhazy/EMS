import { Injectable } from '@nestjs/common';

import { EmailConfirmationService } from './email-confirmation.service';
import { OrderStatus } from './entities/order.entity';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { OrderService } from './order.service';
import { TicketFulfillmentService } from './ticket-fulfillment.service';

@Injectable()
export class FulfillmentService {
  constructor(
    private readonly orderService: OrderService,
    private readonly ticketFulfillmentService: TicketFulfillmentService,
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  async processPayment(payment: PaymentEntity): Promise<void> {
    const mappedOrderStatus = this.mapPaymentToOrderStatus(payment.status);

    if (mappedOrderStatus) {
      await this.orderService.updateStatus(payment.tenantId, payment.orderId, mappedOrderStatus);
    }

    await this.ticketFulfillmentService.syncForPayment(payment);

    if (payment.status === PaymentStatus.SUCCEEDED) {
      await this.emailConfirmationService.sendForPayment(payment);
    }
  }

  private mapPaymentToOrderStatus(status: PaymentStatus): OrderStatus | null {
    switch (status) {
      case PaymentStatus.SUCCEEDED:
        return OrderStatus.PLACED;
      case PaymentStatus.REFUNDED:
        return OrderStatus.REFUNDED;
      case PaymentStatus.FAILED:
      case PaymentStatus.CANCELED:
        return OrderStatus.CANCELLED;
      case PaymentStatus.PENDING:
      case PaymentStatus.AUTHORIZED:
      default:
        return null;
    }
  }
}
