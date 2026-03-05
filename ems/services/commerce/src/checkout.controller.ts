import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { CreateTicketOrderDto } from './dto/create-ticket-order.dto';
import { OrderEntity, OrderStatus } from './entities/order.entity';
import { PaymentEntity } from './entities/payment.entity';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';

@Controller('api/v1/tenants/:tenantId/ticket-purchases')
export class CheckoutController {
  constructor(
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: CreateTicketOrderDto,
  ): Promise<OrderEntity> {
    const items = payload.items ?? [];
    const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
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
      items,
    });
  }

  @Post('orders/:orderId/checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkoutOrder(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() payload: CheckoutOrderDto,
  ): Promise<PaymentEntity> {
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
    @Body() payload: ConfirmPaymentDto,
  ): Promise<PaymentEntity> {
    return this.paymentService.updatePaymentStatus(
      tenantId,
      payload.providerReference,
      payload.status,
    );
  }
}
