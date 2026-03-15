import { Controller, Get, Param, ParseUUIDPipe, Query, UseInterceptors } from '@nestjs/common';

import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';

import { RevenueReportQueryDto } from './dto/revenue-report-query.dto';
import { EventRevenueReport, RevenueReportingService } from './revenue-reporting.service';

@UseInterceptors(ApiResponseInterceptor)
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

  @Get('report/export.json')
  async exportRevenueReportJson(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: RevenueReportQueryDto,
  ): Promise<EventRevenueReport> {
    return this.revenueReportingService.generateEventRevenueReport(tenantId, eventId, query);
  }

  @Get('report/export.csv')
  async exportRevenueReportCsv(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: RevenueReportQueryDto,
  ): Promise<string> {
    const report = await this.revenueReportingService.generateEventRevenueReport(tenantId, eventId, query);

    return [
      'metric,value',
      `ordersCount,${report.ticketSales.ordersCount}`,
      `ticketsSoldCount,${report.ticketSales.ticketsSoldCount}`,
      `grossSalesAmount,${report.ticketSales.grossSalesAmount}`,
      `paymentCount,${report.payments.paymentCount}`,
      `succeededAmount,${report.payments.succeededAmount}`,
      `refundedAmount,${report.payments.refundedAmount}`,
      `pendingAmount,${report.payments.pendingAmount}`,
      `failedCount,${report.payments.failedCount}`,
      `netAmount,${report.payments.netAmount}`,
      `currency,${report.payments.currency}`,
    ].join('\n');
  }
}
