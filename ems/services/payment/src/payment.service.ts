import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { Payment } from './entities/payment.entity';
import { Refund } from './entities/refund.entity';
import { CreatePaymentDto, CompletePaymentDto, RefundDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Refund) private readonly refunds: Repository<Refund>,
    private readonly eventBus: EventBusService,
  ) {}

  async createPayment(tenantId: string, dto: CreatePaymentDto) {
    const payment = this.payments.create({
      tenantId,
      orderId: dto.orderId,
      amountCents: dto.amountCents,
      currency: dto.currency ?? 'USD',
      provider: dto.provider ?? 'manual',
      status: 'pending',
    });
    return this.payments.save(payment);
  }

  async completePayment(id: string, tenantId: string, dto: CompletePaymentDto) {
    const payment = await this.findPayment(id, tenantId);
    if (payment.status !== 'pending') {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }
    payment.status = 'completed';
    if (dto.providerRef) payment.providerRef = dto.providerRef;
    await this.payments.save(payment);
    await this.eventBus.publish('payment.completed', {
      eventType: 'payment.completed',
      tenantId,
      payload: { paymentId: id, orderId: payment.orderId, amountCents: payment.amountCents },
    });
    return payment;
  }

  async failPayment(id: string, tenantId: string) {
    const payment = await this.findPayment(id, tenantId);
    if (payment.status !== 'pending') {
      throw new BadRequestException(`Payment is already ${payment.status}`);
    }
    payment.status = 'failed';
    await this.payments.save(payment);
    await this.eventBus.publish('payment.failed', {
      eventType: 'payment.failed',
      tenantId,
      payload: { paymentId: id, orderId: payment.orderId },
    });
    return payment;
  }

  async refund(id: string, tenantId: string, dto: RefundDto) {
    const payment = await this.findPayment(id, tenantId);
    if (payment.status !== 'completed') {
      throw new BadRequestException('Only completed payments can be refunded');
    }
    if (dto.amountCents > payment.amountCents) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }
    const refund = this.refunds.create({
      paymentId: id,
      tenantId,
      amountCents: dto.amountCents,
      reason: dto.reason,
    });
    await this.refunds.save(refund);
    payment.status = 'refunded';
    await this.payments.save(payment);
    await this.eventBus.publish('payment.refunded', {
      eventType: 'payment.refunded',
      tenantId,
      payload: {
        paymentId: id,
        refundId: refund.id,
        orderId: payment.orderId,
        amountCents: dto.amountCents,
      },
    });
    return refund;
  }

  async findPayment(id: string, tenantId: string) {
    const payment = await this.payments.findOne({ where: { id, tenantId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async listByOrder(orderId: string, tenantId: string) {
    return this.payments.find({ where: { orderId, tenantId }, order: { createdAt: 'DESC' } });
  }
}
