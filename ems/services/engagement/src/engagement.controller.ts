import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';
import { CreatePollDto } from './dto/create-poll.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { EngagementQuestionEntity } from './entities/engagement-question.entity';
import { PollEntity } from './entities/poll.entity';
import { EngagementSurveyEntity } from './entities/engagement-survey.entity';
import { EngagementService } from './engagement.service';

class SubmitPollDto {
  @IsUUID()
  attendeeId!: string;

  @IsString()
  @IsNotEmpty()
  option!: string;
}

class CompleteSurveyDto {
  @IsUUID()
  attendeeId!: string;
}

@UseInterceptors(ApiResponseInterceptor)
@Controller('api/v1/tenants/:tenantId/events/:eventId/engagement')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post('polls')
  @HttpCode(HttpStatus.CREATED)
  async createPoll(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreatePollDto,
  ): Promise<PollEntity> {
    return this.engagementService.createPoll(tenantId, eventId, payload);
  }

  @Get('polls')
  async listPolls(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<PollEntity[]> {
    return this.engagementService.listPolls(tenantId, eventId);
  }

  @Post('polls/:pollId/submissions')
  @HttpCode(HttpStatus.CREATED)
  async submitPoll(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('pollId', ParseUUIDPipe) pollId: string,
    @Body() payload: SubmitPollDto,
  ): Promise<{ status: string }> {
    return this.engagementService.submitPoll(tenantId, eventId, pollId, payload);
  }

  @Patch('polls/:pollId')
  async updatePoll(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('pollId', ParseUUIDPipe) pollId: string,
    @Body() payload: UpdatePollDto,
  ): Promise<PollEntity> {
    return this.engagementService.updatePoll(tenantId, eventId, pollId, payload);
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateQuestionDto,
  ): Promise<EngagementQuestionEntity> {
    return this.engagementService.createQuestion(tenantId, eventId, payload);
  }

  @Get('questions')
  async listQuestions(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query('sessionId') sessionId?: string,
  ): Promise<EngagementQuestionEntity[]> {
    return this.engagementService.listQuestions(tenantId, eventId, sessionId);
  }

  @Post('surveys')
  @HttpCode(HttpStatus.CREATED)
  async createSurvey(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateSurveyDto,
  ): Promise<EngagementSurveyEntity> {
    return this.engagementService.createSurvey(tenantId, eventId, payload);
  }

  @Get('surveys')
  async listSurveys(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EngagementSurveyEntity[]> {
    return this.engagementService.listSurveys(tenantId, eventId);
  }

  @Post('surveys/:surveyId/completions')
  @HttpCode(HttpStatus.CREATED)
  async completeSurvey(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Body() payload: CompleteSurveyDto,
  ): Promise<{ status: string }> {
    return this.engagementService.completeSurvey(tenantId, eventId, surveyId, payload);
  }

  @Patch('surveys/:surveyId')
  async updateSurvey(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Body() payload: UpdateSurveyDto,
  ): Promise<EngagementSurveyEntity> {
    return this.engagementService.updateSurvey(tenantId, eventId, surveyId, payload);
  }
}
