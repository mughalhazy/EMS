import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { OrderEntity } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';

export const COMMERCE_EVENTS_KAFKA_CLIENT = 'COMMERCE_EVENTS_KAFKA_CLIENT';
export const ORDER_CREATED_TOPIC = 'order.created';
export const PAYMENT_COMPLETED_TOPIC = 'payment.completed';

@Injectable()
export class CommerceEventsPublisher {
  private readonly logger = new Logger(CommerceEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(COMMERCE_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishOrderCreated(order: Pick<OrderEntity, 'id' | 'tenantId' | 'status' | 'totals'>): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'commerce.publish.skipped',
          reason: 'kafka_client_unavailable',
          topic: ORDER_CREATED_TOPIC,
          orderId: order.id,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(ORDER_CREATED_TOPIC, {
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: order.tenantId,
      order_id: order.id,
      status: order.status,
      totals: order.totals,
    });
  }

  async publishPaymentCompleted(
    payment: Pick<PaymentEntity, 'id' | 'tenantId' | 'orderId' | 'status' | 'amountMinor' | 'currency'>,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'commerce.publish.skipped',
          reason: 'kafka_client_unavailable',
          topic: PAYMENT_COMPLETED_TOPIC,
          paymentId: payment.id,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(PAYMENT_COMPLETED_TOPIC, {
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: payment.tenantId,
      payment_id: payment.id,
      order_id: payment.orderId,
      status: payment.status,
      amount_minor: payment.amountMinor,
      currency: payment.currency,
    });
  }
}

