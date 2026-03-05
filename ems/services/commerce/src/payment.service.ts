import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { OrderService } from './order.service';
import { StripeCompatibleGateway } from './stripe-compatible.gateway';
import { TicketFulfillmentService } from './ticket-fulfillment.service';

export interface CreatePaymentInput {
  tenantId: string;
  orderId: string;
  amountMinor: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly orderService: OrderService,
    private readonly commerceEventsPublisher: CommerceEventsPublisher,
    private readonly stripeCompatibleGateway: StripeCompatibleGateway,
    private readonly ticketFulfillmentService: TicketFulfillmentService,
    private readonly auditService: AuditService,
  ) {}

  async createForOrder(input: CreatePaymentInput): Promise<PaymentEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: input.orderId, tenantId: input.tenantId },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    const gatewayResult = await this.stripeCompatibleGateway.createPaymentIntent({
      amountMinor: input.amountMinor,
      currency: (input.currency ?? 'USD').toUpperCase(),
      metadata: {
        orderId: input.orderId,
        tenantId: input.tenantId,
        ...(input.metadata ?? {}),
      },
    });

    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        tenantId: input.tenantId,
        orderId: input.orderId,
        provider: 'stripe_compatible',
        providerReference: gatewayResult.providerReference,
        status: gatewayResult.status,
        amountMinor: String(input.amountMinor),
        currency: (input.currency ?? 'USD').toUpperCase(),
        metadata: input.metadata ?? null,
      }),
    );

    await this.publishPaymentCompletedIfNeeded(null, payment);
    await this.syncOrderStatusFromPayment(payment);
    await this.ticketFulfillmentService.syncForPayment(payment);
    await this.trackPurchaseOrRefundAudit(null, payment);

    return payment;
  }

  async updatePaymentStatus(
    tenantId: string,
    providerReference: string,
    status: PaymentStatus,
  ): Promise<PaymentEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { tenantId, providerReference },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }

    const previousStatus = payment.status;
    payment.status = status;
    const savedPayment = await this.paymentRepository.save(payment);
    await this.publishPaymentCompletedIfNeeded(previousStatus, savedPayment);
    await this.syncOrderStatusFromPayment(savedPayment);
    await this.ticketFulfillmentService.syncForPayment(savedPayment);
    await this.trackPurchaseOrRefundAudit(previousStatus, savedPayment);

    return savedPayment;
  }

  private async syncOrderStatusFromPayment(payment: PaymentEntity): Promise<void> {
    const mappedOrderStatus = this.mapPaymentToOrderStatus(payment.status);
    if (!mappedOrderStatus) {
      return;
    }

    await this.orderService.updateStatus(payment.tenantId, payment.orderId, mappedOrderStatus);
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

  private async publishPaymentCompletedIfNeeded(
    previousStatus: PaymentStatus | null,
    payment: PaymentEntity,
  ): Promise<void> {
    if (payment.status !== PaymentStatus.SUCCEEDED || previousStatus === PaymentStatus.SUCCEEDED) {
      return;
    }

    await this.commerceEventsPublisher.publishPaymentCompleted(payment);
  }

  private async trackPurchaseOrRefundAudit(
    beforeStatus: PaymentStatus | null,
    payment: PaymentEntity,
  ): Promise<void> {
    if (payment.status !== PaymentStatus.SUCCEEDED && payment.status !== PaymentStatus.REFUNDED) {
      return;
    }

    if (beforeStatus === payment.status) {
      return;
    }

    const action =
      payment.status === PaymentStatus.SUCCEEDED ? 'ticket.purchase.completed' : 'ticket.refund.completed';

    await this.auditService.trackCommerceChange({
      tenantId: payment.tenantId,
      action,
      before: beforeStatus ? { paymentStatus: beforeStatus } : null,
      after: { paymentStatus: payment.status },
      metadata: {
        orderId: payment.orderId,
        paymentId: payment.id,
        provider: payment.provider,
        providerReference: payment.providerReference,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
      },
    });
  }
}
