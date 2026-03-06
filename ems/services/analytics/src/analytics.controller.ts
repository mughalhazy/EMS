import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { AggregateEventAnalyticsQueryDto } from './dto/aggregate-event-analytics-query.dto';
import { AggregateEventAnalyticsResult, AnalyticsService } from './analytics.service';

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
}
