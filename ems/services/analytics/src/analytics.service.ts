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
import { ExhibitorAnalyticsEntity } from './entities/exhibitor-analytics.entity';

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

export interface EventDashboardOverview extends AggregateEventAnalyticsResult {
  generatedAt: string;
}

export interface EventDashboardTrendPoint {
  snapshotDate: string;
  registrationsCount: number;
  ticketsSoldCount: number;
  attendeesCheckedInCount: number;
  ticketSalesAmount: string;
}

export interface EventDashboardSessionAnalytics {
  sessionId: string;
  registeredAttendees: number;
  checkedInAttendees: number;
  noShowAttendees: number;
  pollResponses: number;
  questionsAsked: number;
  reactions: number;
  totalEngagementActions: number;
  engagementScore: string;
}

export interface EventDashboardExhibitorAnalytics {
  exhibitorId: string;
  leadCapturesCount: number;
  boothVisitsCount: number;
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
    @InjectRepository(ExhibitorAnalyticsEntity)
    private readonly exhibitorAnalyticsRepository: Repository<ExhibitorAnalyticsEntity>,
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

  async getDashboardOverview(
    tenantId: string,
    eventId: string,
    snapshotDate?: string,
  ): Promise<EventDashboardOverview> {
    const aggregate = await this.aggregateEventAnalytics(tenantId, eventId, snapshotDate);

    return {
      ...aggregate,
      generatedAt: new Date().toISOString(),
    };
  }

  async getDashboardTrends(
    tenantId: string,
    eventId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<EventDashboardTrendPoint[]> {
    const queryBuilder = this.eventAnalyticsRepository
      .createQueryBuilder('eventAnalytics')
      .where('eventAnalytics.tenantId = :tenantId', { tenantId })
      .andWhere('eventAnalytics.eventId = :eventId', { eventId });

    if (startDate) {
      queryBuilder.andWhere('eventAnalytics.snapshotDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('eventAnalytics.snapshotDate <= :endDate', { endDate });
    }

    const snapshots = await queryBuilder.orderBy('eventAnalytics.snapshotDate', 'ASC').getMany();

    return snapshots.map((snapshot) => ({
      snapshotDate: snapshot.snapshotDate,
      registrationsCount: snapshot.registrationsCount,
      ticketsSoldCount: snapshot.ticketsSoldCount,
      attendeesCheckedInCount: snapshot.attendeesCheckedInCount,
      ticketSalesAmount: snapshot.ticketSalesAmount,
    }));
  }

  async getTopSessionsForDashboard(
    tenantId: string,
    eventId: string,
    limit: number,
  ): Promise<EventDashboardSessionAnalytics[]> {
    const sessions = await this.sessionAnalyticsRepository.find({
      where: {
        tenantId,
        eventId,
      },
      order: {
        engagementScore: 'DESC',
        totalEngagementActions: 'DESC',
      },
      take: limit,
    });

    return sessions.map((session) => ({
      sessionId: session.sessionId,
      registeredAttendees: session.registeredAttendees,
      checkedInAttendees: session.checkedInAttendees,
      noShowAttendees: session.noShowAttendees,
      pollResponses: session.pollResponses,
      questionsAsked: session.questionsAsked,
      reactions: session.reactions,
      totalEngagementActions: session.totalEngagementActions,
      engagementScore: session.engagementScore,
    }));
  }

  async getTopExhibitorsForDashboard(
    tenantId: string,
    eventId: string,
    limit: number,
  ): Promise<EventDashboardExhibitorAnalytics[]> {
    const rows = await this.exhibitorAnalyticsRepository
      .createQueryBuilder('analytics')
      .select('analytics.exhibitorId', 'exhibitorId')
      .addSelect('COALESCE(SUM(analytics.leadCapturesCount), 0)', 'leadCapturesCount')
      .addSelect('COALESCE(SUM(analytics.boothVisitsCount), 0)', 'boothVisitsCount')
      .where('analytics.tenantId = :tenantId', { tenantId })
      .andWhere('analytics.eventId = :eventId', { eventId })
      .groupBy('analytics.exhibitorId')
      .orderBy('COALESCE(SUM(analytics.leadCapturesCount), 0)', 'DESC')
      .addOrderBy('COALESCE(SUM(analytics.boothVisitsCount), 0)', 'DESC')
      .limit(limit)
      .getRawMany<{
        exhibitorId: string;
        leadCapturesCount: string;
        boothVisitsCount: string;
      }>();

    return rows.map((row) => ({
      exhibitorId: row.exhibitorId,
      leadCapturesCount: Number.parseInt(row.leadCapturesCount ?? '0', 10),
      boothVisitsCount: Number.parseInt(row.boothVisitsCount ?? '0', 10),
    }));
  }
}
