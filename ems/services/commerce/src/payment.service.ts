import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { RegistrationStatus } from '../../registration/src/entities/registration-status.entity';
import { RegistrationEventsPublisher } from '../../registration/src/registration-events.publisher';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { UserEntity } from '../../user/src/entities/user.entity';
import { CommerceEventsPublisher } from './commerce-events.publisher';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';
import { PaymentEntity, PaymentStatus } from './entities/payment.entity';
import { FulfillmentService } from './fulfillment.service';
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
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
    private readonly commerceEventsPublisher: CommerceEventsPublisher,
    private readonly stripeCompatibleGateway: StripeCompatibleGateway,
    private readonly fulfillmentService: FulfillmentService,
    private readonly registrationEventsPublisher: RegistrationEventsPublisher,
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

    await this.publishPaymentCapturedIfNeeded(null, payment);
    await this.syncRegistrationsForPayment(payment);
    await this.fulfillmentService.processPayment(payment);
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
    await this.publishPaymentCapturedIfNeeded(previousStatus, savedPayment);
    await this.syncRegistrationsForPayment(savedPayment);
    await this.fulfillmentService.processPayment(savedPayment);
    await this.trackPurchaseOrRefundAudit(previousStatus, savedPayment);

    return savedPayment;
  }

  private async publishPaymentCapturedIfNeeded(
    previousStatus: PaymentStatus | null,
    payment: PaymentEntity,
  ): Promise<void> {
    if (payment.status !== PaymentStatus.SUCCEEDED || previousStatus === PaymentStatus.SUCCEEDED) {
      return;
    }

    await this.commerceEventsPublisher.publishPaymentCaptured(payment);
  }

  private async syncRegistrationsForPayment(payment: PaymentEntity): Promise<void> {
    if (payment.status !== PaymentStatus.SUCCEEDED) {
      return;
    }

    const items = await this.orderItemRepository.find({
      where: {
        tenantId: payment.tenantId,
        orderId: payment.orderId,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (items.length === 0) {
      return;
    }

    const inventoryIds = Array.from(new Set(items.map((item) => item.inventoryId)));
    const tickets = await this.ticketRepository.find({
      where: inventoryIds.map((inventoryId) => ({
        tenantId: payment.tenantId,
        inventoryId,
      })),
    });
    const ticketByInventoryId = new Map(tickets.map((ticket) => [ticket.inventoryId, ticket]));

    const attendeeEmails = Array.from(
      new Set(
        items
          .flatMap((item) => item.attendees)
          .map((attendee) => attendee.email?.trim().toLowerCase())
          .filter((email): email is string => Boolean(email)),
      ),
    );

    if (attendeeEmails.length === 0) {
      return;
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId: payment.tenantId })
      .andWhere('LOWER(user.email) IN (:...emails)', { emails: attendeeEmails })
      .getMany();

    const userByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));

    const registrationsToCreate: RegistrationEntity[] = [];

    const dedupe = new Set<string>();

    for (const item of items) {
      const ticket = ticketByInventoryId.get(item.inventoryId);
      if (!ticket) {
        continue;
      }

      item.attendees.forEach((attendee, attendeeIndex) => {
        const normalizedEmail = attendee.email?.trim().toLowerCase();
        if (!normalizedEmail) {
          return;
        }

        const user = userByEmail.get(normalizedEmail);
        if (!user) {
          return;
        }

        const key = `${payment.tenantId}:${ticket.eventId}:${user.id}:${ticket.id}:${item.id}:${attendeeIndex}`;
        if (dedupe.has(key)) {
          return;
        }

        dedupe.add(key);
        registrationsToCreate.push(
          this.registrationRepository.create({
            tenantId: payment.tenantId,
            eventId: ticket.eventId,
            userId: user.id,
            ticketId: ticket.id,
            orderId: payment.orderId,
            orderItemId: item.id,
            attendeeIndex,
            status: RegistrationStatus.CONFIRMED,
          }),
        );
      });
    }

    if (registrationsToCreate.length === 0) {
      return;
    }

    for (const registration of registrationsToCreate) {
      const existing = await this.registrationRepository.findOne({
        where: {
          tenantId: registration.tenantId,
          eventId: registration.eventId,
          userId: registration.userId,
          ticketId: registration.ticketId,
        },
      });

      if (existing && existing.status !== RegistrationStatus.CANCELLED) {
        continue;
      }

      const saved = await this.registrationRepository.save({
        ...(existing ?? {}),
        ...registration,
      });

      await this.registrationEventsPublisher.publishRegistrationStarted(saved);
      await this.registrationEventsPublisher.publishRegistrationConfirmed(saved);
    }
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
