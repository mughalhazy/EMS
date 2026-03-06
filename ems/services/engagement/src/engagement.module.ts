import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionQnaEntity } from '../../agenda/src/entities/session-qna.entity';
import { SessionEntity } from '../../agenda/src/entities/session.entity';
import { AuditModule } from '../../audit/src/audit.module';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { SurveyEntity } from '../../event/src/entities/survey.entity';
import { EngagementController } from './engagement.controller';
import { PollEntity } from './entities/poll.entity';
import { EngagementEventsPublisher } from './engagement-events.publisher';
import { EngagementService } from './engagement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PollEntity, SessionQnaEntity, SurveyEntity, SessionEntity, AttendeeEntity]),
    AuditModule,
  ],
  controllers: [EngagementController],
  providers: [EngagementService, EngagementEventsPublisher],
  exports: [TypeOrmModule, EngagementEventsPublisher, EngagementService],
})
export class EngagementModule {}
