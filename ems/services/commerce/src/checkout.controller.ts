import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegistrationQuestionEntity } from '../../event/src/entities/registration-question.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { TicketPricingService } from '../../ticketing/src/ticket-pricing.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import {
  CreateTicketOrderAttendeeDto,
  CreateTicketOrderDto,
} from './dto/create-ticket-order.dto';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';

@Controller('api/v1/tenants/:tenantId/ticket-purchases')
export class CheckoutController {
  private readonly ticketPricingService = new TicketPricingService();
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(RegistrationQuestionEntity)
    private readonly registrationQuestionRepository: Repository<RegistrationQuestionEntity>,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: CreateTicketOrderDto,
  ): Promise<OrderEntity> {
    this.assertIdempotencyKey(idempotencyKey);
    this.assertAttendeeCounts(payload);
    await this.assertTicketOwnershipAndRequiredQuestions(tenantId, payload);

    const pricedItems = await this.buildPricedItems(tenantId, payload);
    const subtotal = Number(pricedItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0).toFixed(2));
    const discount = payload.discount ?? 0;
    const tax = payload.tax ?? 0;

    return this.orderService.create({
      tenantId,
      status: OrderStatus.DRAFT,
      totals: {
        subtotal,
        discount,
        tax,
        grandTotal: subtotal - discount + tax,
      },
      reservations: pricedItems.map((item) => ({
        inventoryId: item.inventoryId,
        quantity: item.quantity,
      })),
      items: pricedItems,
    });
  }

  @Post('orders/:orderId/checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkoutOrder(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: CheckoutOrderDto,
  ): Promise<PaymentEntity> {
    this.assertIdempotencyKey(idempotencyKey);

    const order = await this.orderService.findByTenantAndId(tenantId, orderId);
    if (!order) {
      throw new NotFoundException('Order not found in tenant.');
    }

    return this.paymentService.createForOrder({
      tenantId,
      orderId,
      amountMinor: payload.amountMinor,
      currency: payload.currency,
      metadata: {
        ...(payload.metadata ?? {}),
        checkoutSource: 'ticket_purchase_api',
      },
    });
  }

  @Post('payments/confirm')
  async confirmPayment(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: ConfirmPaymentDto,
  ): Promise<PaymentEntity> {
    this.assertIdempotencyKey(idempotencyKey);

    return this.paymentService.updatePaymentStatus(
      tenantId,
      payload.providerReference,
      payload.status,
    );
  }

  private async buildPricedItems(
    tenantId: string,
    payload: CreateTicketOrderDto,
  ): Promise<CreateTicketOrderDto['items']> {
    const inventoryIds = Array.from(new Set((payload.items ?? []).map((item) => item.inventoryId)));
    if (inventoryIds.length === 0) {
      return [];
    }

    const tickets = await this.ticketRepository.find({
      where: inventoryIds.map((inventoryId) => ({ tenantId, inventoryId })),
      relations: ['pricingTiers', 'earlyBirdRules', 'promoCodes'],
    });

    const ticketByInventoryId = new Map(tickets.map((ticket) => [ticket.inventoryId, ticket]));

    return (payload.items ?? []).map((item) => {
      const ticket = ticketByInventoryId.get(item.inventoryId);
      if (!ticket) {
        throw new BadRequestException(`Ticket not found for inventory '${item.inventoryId}'.`);
      }

      const pricing = this.ticketPricingService.calculate(ticket, {
        quantity: item.quantity,
      });

      return {
        ...item,
        unitPrice: pricing.unitPrice,
      };
    });
  }

  private assertIdempotencyKey(idempotencyKey?: string): void {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key header is required.');
    }
  }

  private assertAttendeeCounts(payload: CreateTicketOrderDto): void {
    for (const item of payload.items ?? []) {
      if (item.attendees && item.attendees.length !== item.quantity) {
        throw new BadRequestException(
          'Each order item must include an attendee entry for each ticket quantity.',
        );
      }
    }
  }

  private async assertTicketOwnershipAndRequiredQuestions(
    tenantId: string,
    payload: CreateTicketOrderDto,
  ): Promise<void> {
    const inventoryIds = Array.from(new Set((payload.items ?? []).map((item) => item.inventoryId)));
    if (inventoryIds.length === 0) {
      return;
    }

    const tickets = await this.ticketRepository.find({
      where: inventoryIds.map((inventoryId) => ({ tenantId, inventoryId })),
    });

    const ticketByInventoryId = new Map(tickets.map((ticket) => [ticket.inventoryId, ticket]));
    const eventIds = Array.from(new Set(tickets.map((ticket) => ticket.eventId)));

    const questions = eventIds.length
      ? await this.registrationQuestionRepository.find({
          where: eventIds.map((eventId) => ({ tenantId, eventId, isActive: true })),
        })
      : [];

    const requiredQuestionIdsByEvent = new Map<string, Set<string>>();

    for (const question of questions) {
      if (!question.isRequired) {
        continue;
      }

      const eventQuestionIds = requiredQuestionIdsByEvent.get(question.eventId) ?? new Set<string>();
      eventQuestionIds.add(question.id);
      requiredQuestionIdsByEvent.set(question.eventId, eventQuestionIds);
    }

    for (const item of payload.items ?? []) {
      const ticket = ticketByInventoryId.get(item.inventoryId);
      if (!ticket) {
        throw new BadRequestException(`Ticket not found for inventory '${item.inventoryId}'.`);
      }

      const attendees = item.attendees ?? [];
      const ticketOwners = attendees.filter((attendee) => attendee.isTicketOwner);
      if (ticketOwners.length !== 1) {
        throw new BadRequestException(
          `Exactly one ticket owner is required for inventory '${item.inventoryId}'.`,
        );
      }

      const requiredQuestionIds = requiredQuestionIdsByEvent.get(ticket.eventId);
      if (!requiredQuestionIds?.size) {
        continue;
      }

      attendees.forEach((attendee, attendeeIndex) => {
        this.assertRequiredQuestionAnswers(item.inventoryId, attendeeIndex, attendee, requiredQuestionIds);
      });
    }
  }

  private assertRequiredQuestionAnswers(
    inventoryId: string,
    attendeeIndex: number,
    attendee: CreateTicketOrderAttendeeDto,
    requiredQuestionIds: Set<string>,
  ): void {
    const answersByQuestionId = new Map(
      (attendee.answers ?? []).map((answer) => [answer.questionId, answer.value]),
    );

    const missingRequiredQuestionIds = Array.from(requiredQuestionIds).filter((questionId) => {
      const value = answersByQuestionId.get(questionId);
      return typeof value !== 'string' || !value.trim();
    });

    if (missingRequiredQuestionIds.length === 0) {
      return;
    }

    throw new BadRequestException(
      `Attendee at index ${attendeeIndex} for inventory '${inventoryId}' is missing required answers for question IDs: ${missingRequiredQuestionIds.join(', ')}.`,
    );
  }
}
