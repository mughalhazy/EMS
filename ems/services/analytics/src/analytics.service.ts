import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderStatus } from '../../commerce/src/entities/order.entity';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { RegistrationEntity, RegistrationStatus } from '../../registration/src/entities/registration.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { CheckInEntity } from '../../onsite/src/entities/check-in.entity';
import { EventAnalyticsEntity } from './entities/event-analytics.entity';

export interface AggregateEventAnalyticsResult {
  tenantId: string;
  eventId: string;
  snapshotDate: string;
  registrationsCount: number;
  ticketsSoldCount: number;
  ticketSalesAmount: string;
  attendeesCheckedInCount: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(EventAnalyticsEntity)
    private readonly eventAnalyticsRepository: Repository<EventAnalyticsEntity>,
    @InjectRepository(RegistrationEntity)
    private readonly registrationRepository: Repository<RegistrationEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(CheckInEntity)
    private readonly checkInRepository: Repository<CheckInEntity>,
  ) {}

  async aggregateEventAnalytics(
    tenantId: string,
    eventId: string,
    snapshotDate?: string,
  ): Promise<AggregateEventAnalyticsResult> {
    const effectiveSnapshotDate = snapshotDate ?? new Date().toISOString().slice(0, 10);

    const registrationsCount = await this.registrationRepository
      .createQueryBuilder('registration')
      .where('registration.tenantId = :tenantId', { tenantId })
      .andWhere('registration.eventId = :eventId', { eventId })
      .andWhere('registration.status != :cancelledStatus', {
        cancelledStatus: RegistrationStatus.CANCELLED,
      })
      .getCount();

    const commerceStats = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orders', 'order', 'order.id = orderItem.orderId')
      .innerJoin(
        TicketEntity,
        'ticket',
        'ticket.inventoryId = orderItem.inventoryId AND ticket.tenantId = :tenantId AND ticket.eventId = :eventId',
        { tenantId, eventId },
      )
      .select('COALESCE(SUM(orderItem.quantity), 0)', 'ticketsSoldCount')
      .addSelect('COALESCE(SUM(orderItem.totalPrice), 0)', 'ticketSalesAmount')
      .where('orderItem.tenantId = :tenantId', { tenantId })
      .andWhere('order.tenantId = :tenantId', { tenantId })
      .andWhere('order.status = :placedStatus', { placedStatus: OrderStatus.PLACED })
      .getRawOne<{
        ticketsSoldCount: string;
        ticketSalesAmount: string;
      }>();

    const attendeesCheckedInCount = await this.checkInRepository
      .createQueryBuilder('checkIn')
      .where('checkIn.eventId = :eventId', { eventId })
      .getCount();

    const aggregate = {
      tenantId,
      eventId,
      snapshotDate: effectiveSnapshotDate,
      registrationsCount,
      ticketsSoldCount: Number.parseInt(commerceStats?.ticketsSoldCount ?? '0', 10),
      ticketSalesAmount: commerceStats?.ticketSalesAmount ?? '0.00',
      attendeesCheckedInCount,
    };

    const existingSnapshot = await this.eventAnalyticsRepository.findOne({
      where: {
        tenantId,
        eventId,
        snapshotDate: effectiveSnapshotDate,
      },
    });

    const snapshot = this.eventAnalyticsRepository.create({
      ...(existingSnapshot ?? {}),
      ...aggregate,
    });

    const savedSnapshot = await this.eventAnalyticsRepository.save(snapshot);

    return {
      tenantId: savedSnapshot.tenantId,
      eventId: savedSnapshot.eventId,
      snapshotDate: savedSnapshot.snapshotDate,
      registrationsCount: savedSnapshot.registrationsCount,
      ticketsSoldCount: savedSnapshot.ticketsSoldCount,
      ticketSalesAmount: savedSnapshot.ticketSalesAmount,
      attendeesCheckedInCount: savedSnapshot.attendeesCheckedInCount,
    };
  }
}
