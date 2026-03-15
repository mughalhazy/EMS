import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderStatus } from '../../commerce/src/entities/order.entity';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import {
  AttendeeConnectionEntity,
  AttendeeConnectionStatus,
} from '../../networking/src/entities/attendee-connection.entity';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { RegistrationStatus } from '../../registration/src/entities/registration-status.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { CheckInEntity } from '../../onsite/src/entities/check-in.entity';
import { EventEntity } from '../../event/src/entities/event.entity';
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

export interface EventDashboardView {
  tenantId: string;
  eventId: string;
  generatedAt: string;
  overview: EventDashboardOverview;
  trends: EventDashboardTrendPoint[];
  topSessions: EventDashboardSessionAnalytics[];
  topExhibitors: EventDashboardExhibitorAnalytics[];
}

export interface TicketSalesSummary {
  tenantId: string;
  eventId: string;
  snapshotDate: string;
  generatedAt: string;
  registrationsCount: number;
  ticketsSoldCount: number;
  ticketSalesAmount: string;
  conversionRate: string;
}

export interface AttendanceMetrics {
  tenantId: string;
  eventId: string;
  snapshotDate: string;
  generatedAt: string;
  registrationsCount: number;
  attendeesCheckedInCount: number;
  checkInRate: string;
  totalEngagementActionsCount: number;
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

export interface AttendeeEngagementReport {
  tenantId: string;
  eventId: string;
  generatedAt: string;
  totals: {
    sessionsTracked: number;
    checkedInAttendees: number;
    engagementActions: number;
    averageEngagementScore: string;
  };
  topSessions: EventDashboardSessionAnalytics[];
}

export interface SponsorRoiReportItem {
  exhibitorId: string;
  leadCapturesCount: number;
  boothVisitsCount: number;
  estimatedPipelineValue: string;
}

export interface SponsorRoiReport {
  tenantId: string;
  eventId: string;
  generatedAt: string;
  assumptions: {
    estimatedValuePerLead: string;
  };
  totals: {
    exhibitorsTracked: number;
    totalLeads: number;
    totalBoothVisits: number;
    estimatedPipelineValue: string;
  };
  exhibitors: SponsorRoiReportItem[];
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
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async aggregateEventAnalytics(
    tenantId: string,
    eventId: string,
    snapshotDate?: string,
  ): Promise<AggregateEventAnalyticsResult> {
    await this.assertTenantEventAccess(tenantId, eventId);

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
    await this.assertTenantEventAccess(tenantId, eventId);
    const aggregate = await this.aggregateEventAnalytics(tenantId, eventId, snapshotDate);

    return {
      ...aggregate,
      generatedAt: new Date().toISOString(),
    };
  }

  async getEventDashboardView(
    tenantId: string,
    eventId: string,
    snapshotDate?: string,
    startDate?: string,
    endDate?: string,
    limit = 5,
  ): Promise<EventDashboardView> {
    const normalizedLimit = Math.max(1, Math.min(limit, 50));
    const [overview, trends, topSessions, topExhibitors] = await Promise.all([
      this.getDashboardOverview(tenantId, eventId, snapshotDate),
      this.getDashboardTrends(tenantId, eventId, startDate, endDate),
      this.getTopSessionsForDashboard(tenantId, eventId, normalizedLimit),
      this.getTopExhibitorsForDashboard(tenantId, eventId, normalizedLimit),
    ]);

    return {
      tenantId,
      eventId,
      generatedAt: new Date().toISOString(),
      overview,
      trends,
      topSessions,
      topExhibitors,
    };
  }

  async getTicketSalesSummary(
    tenantId: string,
    eventId: string,
    snapshotDate?: string,
  ): Promise<TicketSalesSummary> {
    const aggregate = await this.aggregateEventAnalytics(tenantId, eventId, snapshotDate);
    const conversionRate =
      aggregate.registrationsCount > 0
        ? ((aggregate.ticketsSoldCount / aggregate.registrationsCount) * 100).toFixed(2)
        : '0.00';

    return {
      tenantId,
      eventId,
      snapshotDate: aggregate.snapshotDate,
      generatedAt: new Date().toISOString(),
      registrationsCount: aggregate.registrationsCount,
      ticketsSoldCount: aggregate.ticketsSoldCount,
      ticketSalesAmount: aggregate.ticketSalesAmount,
      conversionRate,
    };
  }

  async getAttendanceMetrics(
    tenantId: string,
    eventId: string,
    snapshotDate?: string,
  ): Promise<AttendanceMetrics> {
    const aggregate = await this.aggregateEventAnalytics(tenantId, eventId, snapshotDate);
    const checkInRate =
      aggregate.registrationsCount > 0
        ? ((aggregate.attendeesCheckedInCount / aggregate.registrationsCount) * 100).toFixed(2)
        : '0.00';

    return {
      tenantId,
      eventId,
      snapshotDate: aggregate.snapshotDate,
      generatedAt: new Date().toISOString(),
      registrationsCount: aggregate.registrationsCount,
      attendeesCheckedInCount: aggregate.attendeesCheckedInCount,
      checkInRate,
      totalEngagementActionsCount: aggregate.totalEngagementActionsCount,
    };
  }

  async getDashboardTrends(
    tenantId: string,
    eventId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<EventDashboardTrendPoint[]> {
    await this.assertTenantEventAccess(tenantId, eventId);
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
    await this.assertTenantEventAccess(tenantId, eventId);
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
    await this.assertTenantEventAccess(tenantId, eventId);
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

  async getAttendeeEngagementReport(
    tenantId: string,
    eventId: string,
    limit = 10,
  ): Promise<AttendeeEngagementReport> {
    await this.assertTenantEventAccess(tenantId, eventId);
    const sessions = await this.sessionAnalyticsRepository.find({
      where: {
        tenantId,
        eventId,
      },
      order: {
        engagementScore: 'DESC',
      },
    });

    const checkedInAttendees = sessions.reduce((sum, session) => sum + session.checkedInAttendees, 0);
    const engagementActions = sessions.reduce((sum, session) => sum + session.totalEngagementActions, 0);

    const averageEngagementScore =
      sessions.length > 0
        ? (
            sessions.reduce((sum, session) => sum + Number.parseFloat(session.engagementScore), 0) /
            sessions.length
          ).toFixed(2)
        : '0.00';

    return {
      tenantId,
      eventId,
      generatedAt: new Date().toISOString(),
      totals: {
        sessionsTracked: sessions.length,
        checkedInAttendees,
        engagementActions,
        averageEngagementScore,
      },
      topSessions: sessions.slice(0, Math.max(1, Math.min(limit, 50))).map((session) => ({
        sessionId: session.sessionId,
        registeredAttendees: session.registeredAttendees,
        checkedInAttendees: session.checkedInAttendees,
        noShowAttendees: session.noShowAttendees,
        pollResponses: session.pollResponses,
        questionsAsked: session.questionsAsked,
        reactions: session.reactions,
        totalEngagementActions: session.totalEngagementActions,
        engagementScore: session.engagementScore,
      })),
    };
  }

  async getSponsorRoiReport(
    tenantId: string,
    eventId: string,
    estimatedValuePerLead = '150.00',
  ): Promise<SponsorRoiReport> {
    await this.assertTenantEventAccess(tenantId, eventId);
    const exhibitors = await this.getTopExhibitorsForDashboard(tenantId, eventId, 1000);
    const valuePerLead = Number.parseFloat(estimatedValuePerLead);

    const normalizedValuePerLead = Number.isFinite(valuePerLead) ? valuePerLead : 150;

    const sponsorRows = exhibitors.map((item) => ({
      ...item,
      estimatedPipelineValue: (item.leadCapturesCount * normalizedValuePerLead).toFixed(2),
    }));

    const totals = sponsorRows.reduce(
      (acc, row) => {
        acc.totalLeads += row.leadCapturesCount;
        acc.totalBoothVisits += row.boothVisitsCount;
        acc.estimatedPipelineValue += Number.parseFloat(row.estimatedPipelineValue);
        return acc;
      },
      {
        totalLeads: 0,
        totalBoothVisits: 0,
        estimatedPipelineValue: 0,
      },
    );

    return {
      tenantId,
      eventId,
      generatedAt: new Date().toISOString(),
      assumptions: {
        estimatedValuePerLead: normalizedValuePerLead.toFixed(2),
      },
      totals: {
        exhibitorsTracked: sponsorRows.length,
        totalLeads: totals.totalLeads,
        totalBoothVisits: totals.totalBoothVisits,
        estimatedPipelineValue: totals.estimatedPipelineValue.toFixed(2),
      },
      exhibitors: sponsorRows,
    };
  }

  private async assertTenantEventAccess(tenantId: string, eventId: string): Promise<void> {
    await this.eventRepository.findOneOrFail({
      where: {
        id: eventId,
        tenantId,
      },
      select: {
        id: true,
      },
    });
  }
}
