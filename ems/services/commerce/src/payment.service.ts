import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity, OrderStatus } from './entities/order.entity';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { OrderService } from './order.service';
import { StripeCompatibleGateway } from './stripe-compatible.gateway';

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
    private readonly stripeCompatibleGateway: StripeCompatibleGateway,
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

    await this.syncOrderStatusFromPayment(payment);
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

    payment.status = status;
    const savedPayment = await this.paymentRepository.save(payment);
    await this.syncOrderStatusFromPayment(savedPayment);

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
}
