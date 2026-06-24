import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { InteractiveEngagementService } from './interactive-engagement.service';
import {
  CreatePollDto,
  RespondPollDto,
  SubmitQuestionDto,
  CreateSurveyDto,
  SubmitSurveyResponseDto,
} from './dto/interactive-engagement.dto';

@ApiTags('polls')
@Controller('polls')
@UseGuards(JwtAuthGuard)
export class PollController {
  constructor(private readonly svc: InteractiveEngagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a live poll for a session or event' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreatePollDto) {
    return ok(await this.svc.createPoll(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List polls for an event' })
  async list(@CurrentUser() u: JwtPayload, @Query('eventId') eventId: string) {
    return ok(await this.svc.listPolls(u.tenantId, eventId));
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Submit a poll response' })
  async respond(@Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() dto: RespondPollDto) {
    return ok(await this.svc.respondToPoll(id, u.tenantId, dto));
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get poll results tally' })
  async results(@Param('id') id: string) {
    return ok(await this.svc.getPollResults(id));
  }
}

@ApiTags('qa')
@Controller('qa')
@UseGuards(JwtAuthGuard)
export class QAController {
  constructor(private readonly svc: InteractiveEngagementService) {}

  @Post('questions')
  @ApiOperation({ summary: 'Submit a Q&A question for a session' })
  async submit(@CurrentUser() u: JwtPayload, @Body() dto: SubmitQuestionDto) {
    return ok(await this.svc.submitQuestion(u.tenantId, dto));
  }

  @Get('questions')
  @ApiOperation({ summary: 'List questions for a session (sorted by upvotes)' })
  async list(@Query('sessionId') sessionId: string) {
    return ok(await this.svc.listQuestions(sessionId));
  }

  @Post('questions/:id/upvote')
  @ApiOperation({ summary: 'Upvote a question' })
  async upvote(@Param('id') id: string) {
    return ok(await this.svc.upvoteQuestion(id));
  }

  @Post('questions/:id/answered')
  @ApiOperation({ summary: 'Mark a question as answered' })
  async markAnswered(@Param('id') id: string) {
    return ok(await this.svc.markAnswered(id));
  }
}

@ApiTags('surveys')
@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveyController {
  constructor(private readonly svc: InteractiveEngagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a survey for an event' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateSurveyDto) {
    return ok(await this.svc.createSurvey(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List surveys for an event' })
  async list(@CurrentUser() u: JwtPayload, @Query('eventId') eventId: string) {
    return ok(await this.svc.listSurveys(u.tenantId, eventId));
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Submit a survey response' })
  async respond(@Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() dto: SubmitSurveyResponseDto) {
    return ok(await this.svc.submitSurveyResponse(id, u.tenantId, dto));
  }
}
