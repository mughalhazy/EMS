import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderStatus } from '../../commerce/src/entities/order.entity';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import {
  AttendeeConnectionEntity,
  AttendeeConnectionStatus,
} from '../../networking/src/entities/attendee-connection.entity';
import { RegistrationEntity, RegistrationStatus } from '../../registration/src/entities/registration.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { CheckInEntity } from '../../onsite/src/entities/check-in.entity';
import { EventAnalyticsEntity } from './entities/event-analytics.entity';
import { SessionAnalyticsEntity } from './entities/session-analytics.entity';

export interface AggregateEventAnalyticsResult {
  tenantId: string;
  eventId: string;
  snapshotDate: string;
  registrationsCount: number;
  ticketsSoldCount: number;
  ticketSalesAmount: string;
  attendeesCheckedInCount: number;
  pollResponsesCount: number;
  questionsAskedCount: number;
  networkingConnectionsCount: number;
  totalEngagementActionsCount: number;
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
    @InjectRepository(SessionAnalyticsEntity)
    private readonly sessionAnalyticsRepository: Repository<SessionAnalyticsEntity>,
    @InjectRepository(AttendeeConnectionEntity)
    private readonly attendeeConnectionRepository: Repository<AttendeeConnectionEntity>,
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

    const engagementStats = await this.sessionAnalyticsRepository
      .createQueryBuilder('sessionAnalytics')
      .select('COALESCE(SUM(sessionAnalytics.pollResponses), 0)', 'pollResponsesCount')
      .addSelect('COALESCE(SUM(sessionAnalytics.questionsAsked), 0)', 'questionsAskedCount')
      .where('sessionAnalytics.tenantId = :tenantId', { tenantId })
      .andWhere('sessionAnalytics.eventId = :eventId', { eventId })
      .getRawOne<{
        pollResponsesCount: string;
        questionsAskedCount: string;
      }>();

    const networkingConnectionsCount = await this.attendeeConnectionRepository
      .createQueryBuilder('connection')
      .where('connection.tenantId = :tenantId', { tenantId })
      .andWhere('connection.eventId = :eventId', { eventId })
      .andWhere('connection.status = :status', {
        status: AttendeeConnectionStatus.ACCEPTED,
      })
      .getCount();

    const pollResponsesCount = Number.parseInt(engagementStats?.pollResponsesCount ?? '0', 10);
    const questionsAskedCount = Number.parseInt(engagementStats?.questionsAskedCount ?? '0', 10);
    const totalEngagementActionsCount = pollResponsesCount + questionsAskedCount + networkingConnectionsCount;

    const aggregate = {
      tenantId,
      eventId,
      snapshotDate: effectiveSnapshotDate,
      registrationsCount,
      ticketsSoldCount: Number.parseInt(commerceStats?.ticketsSoldCount ?? '0', 10),
      ticketSalesAmount: commerceStats?.ticketSalesAmount ?? '0.00',
      attendeesCheckedInCount,
      pollResponsesCount,
      questionsAskedCount,
      networkingConnectionsCount,
      totalEngagementActionsCount,
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
      pollResponsesCount,
      questionsAskedCount,
      networkingConnectionsCount,
      totalEngagementActionsCount,
    };
  }
}
