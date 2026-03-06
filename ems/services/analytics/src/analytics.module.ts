import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BoothEntity } from '../../exhibitor/src/entities/booth.entity';
import { AnalyticsEventsConsumer } from './analytics-events.consumer';
import { AnalyticsMetricsService } from './analytics-metrics.service';
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
    ]),
  ],
  providers: [AnalyticsMetricsService, AnalyticsEventsConsumer],
  exports: [AnalyticsMetricsService],
})
export class AnalyticsModule {}
