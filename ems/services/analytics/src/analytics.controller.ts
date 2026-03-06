import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { AggregateEventAnalyticsQueryDto } from './dto/aggregate-event-analytics-query.dto';
import { EventDashboardQueryDto } from './dto/event-dashboard-query.dto';
import {
  AggregateEventAnalyticsResult,
  AnalyticsService,
  AttendeeEngagementReport,
  EventDashboardExhibitorAnalytics,
  EventDashboardOverview,
  EventDashboardSessionAnalytics,
  EventDashboardTrendPoint,
  SponsorRoiReport,
} from './analytics.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('aggregate')
  async aggregateEventAnalytics(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: AggregateEventAnalyticsQueryDto,
  ): Promise<AggregateEventAnalyticsResult> {
    return this.analyticsService.aggregateEventAnalytics(tenantId, eventId, query.snapshotDate);
  }

  @Get('dashboard/overview')
  async getDashboardOverview(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: EventDashboardQueryDto,
  ): Promise<EventDashboardOverview> {
    return this.analyticsService.getDashboardOverview(tenantId, eventId, query.snapshotDate);
  }

  @Get('dashboard/trends')
  async getDashboardTrends(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: EventDashboardQueryDto,
  ): Promise<EventDashboardTrendPoint[]> {
    return this.analyticsService.getDashboardTrends(tenantId, eventId, query.startDate, query.endDate);
  }

  @Get('dashboard/sessions')
  async getDashboardSessions(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: EventDashboardQueryDto,
  ): Promise<EventDashboardSessionAnalytics[]> {
    return this.analyticsService.getTopSessionsForDashboard(tenantId, eventId, this.resolveLimit(query.limit));
  }

  @Get('dashboard/exhibitors')
  async getDashboardExhibitors(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: EventDashboardQueryDto,
  ): Promise<EventDashboardExhibitorAnalytics[]> {
    return this.analyticsService.getTopExhibitorsForDashboard(tenantId, eventId, this.resolveLimit(query.limit));
  }

  @Get('reports/engagement')
  async getAttendeeEngagementReport(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: EventDashboardQueryDto,
  ): Promise<AttendeeEngagementReport> {
    return this.analyticsService.getAttendeeEngagementReport(tenantId, eventId, this.resolveLimit(query.limit));
  }

  @Get('reports/sponsors/roi')
  async getSponsorRoiReport(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<SponsorRoiReport> {
    return this.analyticsService.getSponsorRoiReport(tenantId, eventId);
  }

  @Get('reports/sponsors/roi/export.csv')
  async exportSponsorRoiReportCsv(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<string> {
    const report = await this.analyticsService.getSponsorRoiReport(tenantId, eventId);
    const header = 'exhibitorId,leadCapturesCount,boothVisitsCount,estimatedPipelineValue';
    const rows = report.exhibitors.map(
      (item) =>
        `${item.exhibitorId},${item.leadCapturesCount},${item.boothVisitsCount},${item.estimatedPipelineValue}`,
    );

    return [header, ...rows].join('\n');
  }

  private resolveLimit(limit?: string): number {
    const parsedLimit = Number.parseInt(limit ?? '10', 10);

    if (Number.isNaN(parsedLimit)) {
      return 10;
    }

    return Math.max(1, Math.min(parsedLimit, 50));
  }
}
