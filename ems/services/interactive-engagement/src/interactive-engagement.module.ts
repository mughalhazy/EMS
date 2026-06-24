import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './entities/poll.entity';
import { PollResponse } from './entities/poll-response.entity';
import { QAQuestion } from './entities/qa-question.entity';
import { Survey } from './entities/survey.entity';
import { SurveyResponse } from './entities/survey-response.entity';
import { InteractiveEngagementService } from './interactive-engagement.service';
import { PollController, QAController, SurveyController } from './interactive-engagement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, PollResponse, QAQuestion, Survey, SurveyResponse])],
  controllers: [PollController, QAController, SurveyController],
  providers: [InteractiveEngagementService],
  exports: [InteractiveEngagementService],
})
export class InteractiveEngagementModule {}
