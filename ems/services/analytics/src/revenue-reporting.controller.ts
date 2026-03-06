import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { RevenueReportQueryDto } from './dto/revenue-report-query.dto';
import { EventRevenueReport, RevenueReportingService } from './revenue-reporting.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/revenue')
export class RevenueReportingController {
  constructor(private readonly revenueReportingService: RevenueReportingService) {}

  @Get('report')
  async generateRevenueReport(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: RevenueReportQueryDto,
  ): Promise<EventRevenueReport> {
    return this.revenueReportingService.generateEventRevenueReport(tenantId, eventId, query);
  }
}
