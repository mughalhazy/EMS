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
  UseInterceptors,
} from '@nestjs/common';

import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';
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

@Controller('api/v1/tenants/:tenantId')
@UseInterceptors(ApiResponseInterceptor)
export class CheckoutController {
  private static readonly IDEMPOTENCY_TTL_MS = 10 * 60_000;

  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly rateLimitService: RateLimitService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: CreateTicketOrderDto,
  ): Promise<OrderEntity> {
    const normalizedIdempotencyKey = this.assertIdempotencyKey(idempotencyKey);
    this.rateLimitService.assertWithinLimit(`create-order:${tenantId}`, 30, 60_000);

    return this.idempotencyService.execute(
      `create-order:${tenantId}`,
      normalizedIdempotencyKey,
      CheckoutController.IDEMPOTENCY_TTL_MS,
      async () => {
        this.assertAttendeeCounts(payload);
        this.assertTicketOwnership(payload);

        const pricedItems = this.buildPricedItems(payload);
        const subtotal = Number(
          pricedItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0).toFixed(2),
        );
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
  ): Promise<PaymentEntity> {
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

        return this.paymentService.createForOrder({
          tenantId,
          orderId,
          amountMinor: payload.amountMinor,
          currency: payload.currency,
          metadata: {
            ...(payload.metadata ?? {}),
            checkoutSource: 'orders_api',
          },
        });
      },
    );
  }

  @Post('payments/confirmations')
  async confirmPayment(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() payload: ConfirmPaymentDto,
  ): Promise<PaymentEntity> {
    const normalizedIdempotencyKey = this.assertIdempotencyKey(idempotencyKey);
    this.rateLimitService.assertWithinLimit(`confirm-payment:${tenantId}`, 60, 60_000);

    return this.idempotencyService.execute(
      `confirm-payment:${tenantId}:${payload.providerReference}`,
      normalizedIdempotencyKey,
      CheckoutController.IDEMPOTENCY_TTL_MS,
      async () =>
        this.paymentService.updatePaymentStatus(
          tenantId,
          payload.providerReference,
          payload.status,
        ),
    );
  }

  private buildPricedItems(payload: CreateTicketOrderDto): CreateTicketOrderDto['items'] {
    return (payload.items ?? []).map((item) => {
      if (!item.inventoryId?.trim()) {
        throw new BadRequestException('Each order item must include an inventoryId.');
      }

      if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
        throw new BadRequestException(`Order item '${item.inventoryId}' has an invalid unitPrice.`);
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new BadRequestException(`Order item '${item.inventoryId}' has an invalid quantity.`);
      }

      return {
        ...item,
        unitPrice: Number(item.unitPrice.toFixed(2)),
      };
    });
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

  private assertTicketOwnership(payload: CreateTicketOrderDto): void {
    for (const item of payload.items ?? []) {
      const attendees = item.attendees ?? [];
      const ticketOwners = attendees.filter((attendee) => attendee.isTicketOwner);
      if (ticketOwners.length !== 1) {
        throw new BadRequestException(
          `Exactly one ticket owner is required for inventory '${item.inventoryId}'.`,
        );
      }

      attendees.forEach((attendee, attendeeIndex) => {
        this.assertProvidedQuestionAnswers(item.inventoryId, attendeeIndex, attendee);
      });
    }
  }

  private assertProvidedQuestionAnswers(
    inventoryId: string,
    attendeeIndex: number,
    attendee: CreateTicketOrderAttendeeDto,
  ): void {
    for (const answer of attendee.answers ?? []) {
      if (!answer.questionId?.trim()) {
        throw new BadRequestException(
          `Attendee at index ${attendeeIndex} for inventory '${inventoryId}' has an answer without questionId.`,
        );
      }

      if (typeof answer.value !== 'string' || !answer.value.trim()) {
        throw new BadRequestException(
          `Attendee at index ${attendeeIndex} for inventory '${inventoryId}' has an empty answer for question '${answer.questionId}'.`,
        );
      }
    }
  }
}
