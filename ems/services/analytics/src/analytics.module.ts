import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { PaymentEntity } from '../../commerce/src/entities/payment.entity';
import { BoothEntity } from '../../exhibitor/src/entities/booth.entity';
import { EventEntity } from '../../event/src/entities/event.entity';
import { AttendeeConnectionEntity } from '../../networking/src/entities/attendee-connection.entity';
import { CheckInEntity } from '../../onsite/src/entities/check-in.entity';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEventsConsumer } from './analytics-events.consumer';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { AnalyticsService } from './analytics.service';
import { RevenueReportingController } from './revenue-reporting.controller';
import { RevenueReportingService } from './revenue-reporting.service';
import { EventAnalyticsEntity } from './entities/event-analytics.entity';
import { ExhibitorAnalyticsEntity } from './entities/exhibitor-analytics.entity';
import { SessionAnalyticsEntity } from './entities/session-analytics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventAnalyticsEntity,
      SessionAnalyticsEntity,
      ExhibitorAnalyticsEntity,
      BoothEntity,
      OrderItemEntity,
      PaymentEntity,
      RegistrationEntity,
      CheckInEntity,
      AttendeeConnectionEntity,
      TicketEntity,
      EventEntity,
    ]),
  ],
  controllers: [AnalyticsController, RevenueReportingController],
  providers: [AnalyticsMetricsService, AnalyticsEventsConsumer, AnalyticsService, RevenueReportingService],
  exports: [AnalyticsMetricsService, AnalyticsService, RevenueReportingService],
})
export class AnalyticsModule {}
