import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';

import { OrderItemEntity } from './entities/order-item.entity';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import {
  TicketFulfillmentEntity,
  TicketFulfillmentStatus,
} from './entities/ticket-fulfillment.entity';

@Injectable()
export class TicketFulfillmentService {
  constructor(
    @InjectRepository(TicketFulfillmentEntity)
    private readonly fulfillmentRepository: Repository<TicketFulfillmentEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async syncForPayment(payment: PaymentEntity): Promise<void> {
    if (payment.status === PaymentStatus.SUCCEEDED) {
      await this.generateForOrder(payment.tenantId, payment.orderId, payment.id);
      return;
    }

    if (
      payment.status === PaymentStatus.REFUNDED ||
      payment.status === PaymentStatus.FAILED ||
      payment.status === PaymentStatus.CANCELED
    ) {
      await this.revokeForOrder(payment.tenantId, payment.orderId, payment.id);
    }
  }

  private async generateForOrder(tenantId: string, orderId: string, paymentId: string): Promise<void> {
    const orderItems = await this.orderItemRepository.find({
      where: { tenantId, orderId },
    });

    for (const item of orderItems) {
      const existing = await this.fulfillmentRepository.findOne({
        where: { tenantId, orderId, orderItemId: item.id },
      });

      if (existing && existing.status !== TicketFulfillmentStatus.REVOKED) {
        continue;
      }

      const qrCode = this.generateDeterministicQrCode(paymentId, item.id);
      const fulfillment = this.fulfillmentRepository.create({
        ...(existing ?? {}),
        tenantId,
        orderId,
        orderItemId: item.id,
        qrCode,
        status: TicketFulfillmentStatus.GENERATED,
        metadata: {
          paymentId,
          quantity: item.quantity,
          inventoryId: item.inventoryId,
        },
      });

      await this.fulfillmentRepository.save(fulfillment);
    }
  }

  private async revokeForOrder(tenantId: string, orderId: string, paymentId: string): Promise<void> {
    const existing = await this.fulfillmentRepository.find({ where: { tenantId, orderId } });

    for (const fulfillment of existing) {
      fulfillment.status = TicketFulfillmentStatus.REVOKED;
      fulfillment.metadata = {
        ...(fulfillment.metadata ?? {}),
        revokedByPaymentId: paymentId,
      };
      await this.fulfillmentRepository.save(fulfillment);
    }
  }

  private generateDeterministicQrCode(paymentId: string, orderItemId: string): string {
    const digest = createHash('sha256').update(`${paymentId}:${orderItemId}`).digest('hex').slice(0, 24);
    return `qr_${digest}`;
  }
}
