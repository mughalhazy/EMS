import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionEntity } from '../../agenda/src/entities/session.entity';
import { AuditModule } from '../../audit/src/audit.module';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { EngagementController } from './engagement.controller';
import { EngagementQuestionEntity } from './entities/engagement-question.entity';
import { PollEntity } from './entities/poll.entity';
import { EngagementSurveyEntity } from './entities/engagement-survey.entity';
import { EngagementEventsPublisher } from './engagement-events.publisher';
import { EngagementService } from './engagement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PollEntity, EngagementQuestionEntity, EngagementSurveyEntity, SessionEntity, AttendeeEntity]),
    AuditModule,
  ],
  controllers: [EngagementController],
  providers: [EngagementService, EngagementEventsPublisher],
  exports: [TypeOrmModule, EngagementEventsPublisher, EngagementService],
})
export class EngagementModule {}
