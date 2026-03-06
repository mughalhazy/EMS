import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { PaymentEntity } from '../../commerce/src/entities/payment.entity';
import { BoothEntity } from '../../exhibitor/src/entities/booth.entity';
import { AttendeeConnectionEntity } from '../../networking/src/entities/attendee-connection.entity';
import { CheckInEntity } from '../../onsite/src/entities/check-in.entity';
import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEventsConsumer } from './analytics-events.consumer';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { RevenueReportingController } from './revenue-reporting.controller';
import { RevenueReportingService } from './revenue-reporting.service';
import { EventAnalyticsEntity } from './entities/event-analytics.entity';
import { ExhibitorAnalyticsEntity } from './entities/exhibitor-analytics.entity';
import { SessionAnalyticsEntity } from './entities/session-analytics.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventAnalyticsEntity,
      SessionAnalyticsEntity,
      ExhibitorAnalyticsEntity,
      BoothEntity,
      OrderItemEntity,
      PaymentEntity,
    ]),
  ],
  controllers: [RevenueReportingController],
  providers: [AnalyticsMetricsService, AnalyticsEventsConsumer, RevenueReportingService],
  exports: [AnalyticsMetricsService, RevenueReportingService],
})
export class AnalyticsModule {}
