import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PollEntity } from './entities/poll.entity';
import { EngagementEventsPublisher } from './engagement-events.publisher';

@Module({
  imports: [TypeOrmModule.forFeature([PollEntity])],
  providers: [EngagementEventsPublisher],
  exports: [TypeOrmModule, EngagementEventsPublisher],
})
export class EngagementModule {}
