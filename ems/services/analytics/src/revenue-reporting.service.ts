import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository } from 'typeorm';

import { OrderStatus } from '../../commerce/src/entities/order.entity';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { PaymentEntity, PaymentStatus } from '../../commerce/src/entities/payment.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { RevenueReportQueryDto } from './dto/revenue-report-query.dto';

export interface EventRevenueReport {
  tenantId: string;
  eventId: string;
  range: {
    startDate: string | null;
    endDate: string | null;
  };
  generatedAt: string;
  ticketSales: {
    ordersCount: number;
    ticketsSoldCount: number;
    grossSalesAmount: string;
  };
  payments: {
    paymentCount: number;
    succeededAmount: string;
    refundedAmount: string;
    pendingAmount: string;
    failedCount: number;
    netAmount: string;
    currency: string;
  };
}

interface TicketSalesAggregation {
  ordersCount: string;
  ticketsSoldCount: string;
  grossSalesAmount: string;
}

interface PaymentAggregation {
  paymentCount: string;
  succeededAmountMinor: string;
  refundedAmountMinor: string;
  pendingAmountMinor: string;
  failedCount: string;
}

@Injectable()
export class RevenueReportingService {
  constructor(
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async generateEventRevenueReport(
    tenantId: string,
    eventId: string,
    query: RevenueReportQueryDto,
  ): Promise<EventRevenueReport> {
    const ticketSalesAggregation = await this.getTicketSalesAggregation(tenantId, eventId, query);
    const paymentAggregation = await this.getPaymentAggregation(tenantId, eventId, query);

    const succeededAmount = this.minorToMajor(paymentAggregation.succeededAmountMinor);
    const refundedAmount = this.minorToMajor(paymentAggregation.refundedAmountMinor);
    const pendingAmount = this.minorToMajor(paymentAggregation.pendingAmountMinor);
    const netAmount = (Number.parseFloat(succeededAmount) - Number.parseFloat(refundedAmount)).toFixed(2);

    return {
      tenantId,
      eventId,
      range: {
        startDate: query.startDate ?? null,
        endDate: query.endDate ?? null,
      },
      generatedAt: new Date().toISOString(),
      ticketSales: {
        ordersCount: Number.parseInt(ticketSalesAggregation.ordersCount ?? '0', 10),
        ticketsSoldCount: Number.parseInt(ticketSalesAggregation.ticketsSoldCount ?? '0', 10),
        grossSalesAmount: this.asCurrency(ticketSalesAggregation.grossSalesAmount),
      },
      payments: {
        paymentCount: Number.parseInt(paymentAggregation.paymentCount ?? '0', 10),
        succeededAmount,
        refundedAmount,
        pendingAmount,
        failedCount: Number.parseInt(paymentAggregation.failedCount ?? '0', 10),
        netAmount,
        currency: 'USD',
      },
    };
  }

  private async getTicketSalesAggregation(
    tenantId: string,
    eventId: string,
    query: RevenueReportQueryDto,
  ): Promise<TicketSalesAggregation> {
    const queryBuilder = this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orders', 'order', 'order.id = orderItem.orderId')
      .innerJoin(
        TicketEntity,
        'ticket',
        'ticket.inventoryId = orderItem.inventoryId AND ticket.tenantId = :tenantId AND ticket.eventId = :eventId',
        { tenantId, eventId },
      )
      .select('COALESCE(COUNT(DISTINCT order.id), 0)', 'ordersCount')
      .addSelect('COALESCE(SUM(orderItem.quantity), 0)', 'ticketsSoldCount')
      .addSelect('COALESCE(SUM(orderItem.totalPrice), 0)', 'grossSalesAmount')
      .where('orderItem.tenantId = :tenantId', { tenantId })
      .andWhere('order.tenantId = :tenantId', { tenantId })
      .andWhere('order.status = :placedStatus', { placedStatus: OrderStatus.PLACED });

    this.applyDateRange(queryBuilder, 'order.createdAt', query.startDate, query.endDate);

    return queryBuilder.getRawOne<TicketSalesAggregation>();
  }

  private async getPaymentAggregation(
    tenantId: string,
    eventId: string,
    query: RevenueReportQueryDto,
  ): Promise<PaymentAggregation> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('orders', 'order', 'order.id = payment.orderId')
      .select('COUNT(payment.id)', 'paymentCount')
      .addSelect(
        'COALESCE(SUM(CASE WHEN payment.status = :succeededStatus THEN payment.amountMinor ELSE 0 END), 0)',
        'succeededAmountMinor',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN payment.status = :refundedStatus THEN payment.amountMinor ELSE 0 END), 0)',
        'refundedAmountMinor',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN payment.status IN (:...pendingStatuses) THEN payment.amountMinor ELSE 0 END), 0)',
        'pendingAmountMinor',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN payment.status = :failedStatus THEN 1 ELSE 0 END), 0)',
        'failedCount',
      )
      .where('payment.tenantId = :tenantId', { tenantId })
      .andWhere('order.tenantId = :tenantId', { tenantId })
      .andWhere(
        `EXISTS (
          SELECT 1
          FROM order_items order_item
          INNER JOIN tickets ticket ON ticket.inventory_id = order_item.inventory_id
          WHERE order_item.order_id = order.id
            AND order_item.tenant_id = :tenantId
            AND ticket.tenant_id = :tenantId
            AND ticket.event_id = :eventId
        )`,
        { eventId },
      )
      .setParameters({
        succeededStatus: PaymentStatus.SUCCEEDED,
        refundedStatus: PaymentStatus.REFUNDED,
        pendingStatuses: [PaymentStatus.PENDING, PaymentStatus.AUTHORIZED],
        failedStatus: PaymentStatus.FAILED,
      });

    this.applyDateRange(queryBuilder, 'payment.createdAt', query.startDate, query.endDate);

    return queryBuilder.getRawOne<PaymentAggregation>();
  }

  private applyDateRange(
    queryBuilder: SelectQueryBuilder<unknown>,
    dateColumn: string,
    startDate?: string,
    endDate?: string,
  ): void {
    if (startDate) {
      queryBuilder.andWhere(`${dateColumn} >= :startDate`, {
        startDate: `${startDate}T00:00:00.000Z`,
      });
    }

    if (endDate) {
      queryBuilder.andWhere(`${dateColumn} <= :endDate`, {
        endDate: `${endDate}T23:59:59.999Z`,
      });
    }
  }

  private asCurrency(value?: string): string {
    return Number.parseFloat(value ?? '0').toFixed(2);
  }

  private minorToMajor(value?: string): string {
    return (Number.parseFloat(value ?? '0') / 100).toFixed(2);
  }
}
