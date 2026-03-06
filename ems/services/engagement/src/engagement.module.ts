import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionQnaEntity } from '../../agenda/src/entities/session-qna.entity';
import { SessionEntity } from '../../agenda/src/entities/session.entity';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { SurveyEntity } from '../../event/src/entities/survey.entity';
import { EngagementController } from './engagement.controller';
import { PollEntity } from './entities/poll.entity';
import { EngagementService } from './engagement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PollEntity,
      SessionQnaEntity,
      SurveyEntity,
      SessionEntity,
      AttendeeEntity,
    ]),
  ],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService, TypeOrmModule],
})
export class EngagementModule {}
