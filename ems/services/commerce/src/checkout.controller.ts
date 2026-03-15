import {
  BadRequestException,
  Body,
  ConflictException,
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
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import {
  CreateTicketOrderAttendeeDto,
  CreateTicketOrderDto,
} from './dto/create-ticket-order.dto';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { IdempotencyService } from './idempotency.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { RateLimitService } from './rate-limit.service';
import { RequestCacheService } from './request-cache.service';

interface ApiSuccessResponse<T> {
  data: T;
  meta: {
    timestamp: string;
  };
}

@Controller('api/v1/tenants/:tenantId')
export class CheckoutController {
  private static readonly CACHE_TTL_MS = 15_000;
  private static readonly IDEMPOTENCY_TTL_MS = 10 * 60_000;

  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepository: Repository<TicketEntity>,
    @InjectRepository(RegistrationQuestionEntity)
    private readonly registrationQuestionRepository: Repository<RegistrationQuestionEntity>,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly requestCacheService: RequestCacheService,
    private readonly rateLimitService: RateLimitService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: CreateTicketOrderDto,
  ): Promise<ApiSuccessResponse<OrderEntity>> {
    const normalizedIdempotencyKey = this.assertIdempotencyKey(idempotencyKey);
    this.rateLimitService.assertWithinLimit(`create-order:${tenantId}`, 30, 60_000);

    return this.idempotencyService.execute(
      `create-order:${tenantId}`,
      normalizedIdempotencyKey,
      CheckoutController.IDEMPOTENCY_TTL_MS,
      async () => {
        this.assertAttendeeCounts(payload);
        await this.assertTicketOwnershipAndRequiredQuestions(tenantId, payload);

        const pricedItems = await this.buildPricedItems(tenantId, payload);
        const subtotal = Number(
          pricedItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0).toFixed(2),
        );
        const discount = payload.discount ?? 0;
        const tax = payload.tax ?? 0;

        const order = await this.orderService.create({
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

        return this.success(order);
      },
    );
  }

  @Post('orders/:orderId/payments')
  @HttpCode(HttpStatus.CREATED)
  async checkoutOrder(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: CheckoutOrderDto,
  ): Promise<ApiSuccessResponse<PaymentEntity>> {
    const normalizedIdempotencyKey = this.assertIdempotencyKey(idempotencyKey);
    this.rateLimitService.assertWithinLimit(`checkout-order:${tenantId}`, 40, 60_000);

    return this.idempotencyService.execute(
      `checkout-order:${tenantId}:${orderId}`,
      normalizedIdempotencyKey,
      CheckoutController.IDEMPOTENCY_TTL_MS,
      async () => {
        const order = await this.orderService.findByTenantAndId(tenantId, orderId);
        if (!order) {
          throw new NotFoundException('Order not found in tenant.');
        }

        if (order.reservationExpiresAt && order.reservationExpiresAt.getTime() <= Date.now()) {
          throw new ConflictException('Inventory reservation expired. Please create a new order.');
        }

        const payment = await this.paymentService.createForOrder({
          tenantId,
          orderId,
          amountMinor: payload.amountMinor,
          currency: payload.currency,
          metadata: {
            ...(payload.metadata ?? {}),
            checkoutSource: 'orders_api',
          },
        });

        return this.success(payment);
      },
    );
  }

  @Post('payments/confirmations')
  async confirmPayment(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: ConfirmPaymentDto,
  ): Promise<ApiSuccessResponse<PaymentEntity>> {
    const normalizedIdempotencyKey = this.assertIdempotencyKey(idempotencyKey);
    this.rateLimitService.assertWithinLimit(`confirm-payment:${tenantId}`, 60, 60_000);

    return this.idempotencyService.execute(
      `confirm-payment:${tenantId}:${payload.providerReference}`,
      normalizedIdempotencyKey,
      CheckoutController.IDEMPOTENCY_TTL_MS,
      async () => {
        const payment = await this.paymentService.updatePaymentStatus(
          tenantId,
          payload.providerReference,
          payload.status,
        );

        return this.success(payment);
      },
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

    const sortedInventoryIds = [...inventoryIds].sort((a, b) => a.localeCompare(b));
    const tickets = await this.requestCacheService.getOrSet(
      `tickets:${tenantId}:${sortedInventoryIds.join(',')}`,
      CheckoutController.CACHE_TTL_MS,
      () =>
        this.ticketRepository.find({
          where: inventoryIds.map((inventoryId) => ({ tenantId, inventoryId })),
        }),
    );

    const ticketByInventoryId = new Map(tickets.map((ticket) => [ticket.inventoryId, ticket]));

    return (payload.items ?? []).map((item) => {
      const ticket = ticketByInventoryId.get(item.inventoryId);
      if (!ticket) {
        throw new BadRequestException(`Ticket not found for inventory '${item.inventoryId}'.`);
      }

      return {
        ...item,
        unitPrice: Number(ticket.totalPrice),
      };
    });
  }

  private success<T>(data: T): ApiSuccessResponse<T> {
    return {
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  private assertIdempotencyKey(idempotencyKey?: string): string {
    const normalizedKey = idempotencyKey?.trim();
    if (!normalizedKey) {
      throw new BadRequestException('Idempotency-Key header is required.');
    }

    return normalizedKey;
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

    const sortedInventoryIds = [...inventoryIds].sort((a, b) => a.localeCompare(b));
    const tickets = await this.requestCacheService.getOrSet(
      `ticket-ownership:${tenantId}:${sortedInventoryIds.join(',')}`,
      CheckoutController.CACHE_TTL_MS,
      () =>
        this.ticketRepository.find({
          where: inventoryIds.map((inventoryId) => ({ tenantId, inventoryId })),
        }),
    );

    const ticketByInventoryId = new Map(tickets.map((ticket) => [ticket.inventoryId, ticket]));
    const eventIds = Array.from(new Set(tickets.map((ticket) => ticket.eventId)));
    const sortedEventIds = [...eventIds].sort((a, b) => a.localeCompare(b));

    const questions = sortedEventIds.length
      ? await this.requestCacheService.getOrSet(
          `registration-questions:${tenantId}:${sortedEventIds.join(',')}`,
          CheckoutController.CACHE_TTL_MS,
          () =>
            this.registrationQuestionRepository.find({
              where: sortedEventIds.map((eventId) => ({ tenantId, eventId, isActive: true })),
            }),
        )
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
