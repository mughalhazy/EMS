import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionQnaEntity } from '../../agenda/src/entities/session-qna.entity';
import { SessionEntity } from '../../agenda/src/entities/session.entity';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { SurveyEntity } from '../../event/src/entities/survey.entity';
import { EngagementController } from './engagement.controller';
import { PollEntity } from './entities/poll.entity';
import { EngagementEventsPublisher } from './engagement-events.publisher';

@Module({
  imports: [TypeOrmModule.forFeature([PollEntity])],
  providers: [EngagementEventsPublisher],
  exports: [TypeOrmModule, EngagementEventsPublisher],
})
export class EngagementModule {}
