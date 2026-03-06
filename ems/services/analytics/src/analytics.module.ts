import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItemEntity } from '../../commerce/src/entities/order-item.entity';
import { RegistrationEntity } from '../../registration/src/entities/registration.entity';
import { TicketEntity } from '../../ticketing/src/entities/ticket.entity';
import { CheckInEntity } from '../../onsite/src/entities/check-in.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { EventAnalyticsEntity } from './entities/event-analytics.entity';
import { SessionAnalyticsEntity } from './entities/session-analytics.entity';
import { ExhibitorAnalyticsEntity } from './entities/exhibitor-analytics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventAnalyticsEntity,
      SessionAnalyticsEntity,
      ExhibitorAnalyticsEntity,
      RegistrationEntity,
      OrderItemEntity,
      TicketEntity,
      CheckInEntity,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
