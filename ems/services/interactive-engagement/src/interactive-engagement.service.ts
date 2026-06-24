import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { Poll } from './entities/poll.entity';
import { PollResponse } from './entities/poll-response.entity';
import { QAQuestion } from './entities/qa-question.entity';
import { Survey } from './entities/survey.entity';
import { SurveyResponse } from './entities/survey-response.entity';
import {
  CreatePollDto,
  RespondPollDto,
  SubmitQuestionDto,
  CreateSurveyDto,
  SubmitSurveyResponseDto,
} from './dto/interactive-engagement.dto';

@Injectable()
export class InteractiveEngagementService implements OnModuleInit {
  constructor(
    @InjectRepository(Poll) private readonly polls: Repository<Poll>,
    @InjectRepository(PollResponse) private readonly pollResponses: Repository<PollResponse>,
    @InjectRepository(QAQuestion) private readonly questions: Repository<QAQuestion>,
    @InjectRepository(Survey) private readonly surveys: Repository<Survey>,
    @InjectRepository(SurveyResponse) private readonly surveyResponses: Repository<SurveyResponse>,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      'interactive-engagement-service',
      ['event.cancelled'],
      async (event) => {
        const { payload } = event as unknown as { payload: { eventId: string } };
        await this.polls.update({ eventId: payload.eventId }, { active: false });
        await this.surveys.update({ eventId: payload.eventId }, { active: false });
      },
    );
  }

  async createPoll(tenantId: string, dto: CreatePollDto) {
    const poll = this.polls.create({ tenantId, ...dto });
    await this.polls.save(poll);
    await this.eventBus.publish('poll.created', {
      eventType: 'poll.created',
      tenantId,
      payload: { pollId: poll.id, eventId: dto.eventId, sessionId: dto.sessionId ?? null },
    });
    return poll;
  }

  async respondToPoll(pollId: string, tenantId: string, dto: RespondPollDto) {
    const poll = await this.polls.findOne({ where: { id: pollId } });
    if (!poll) throw new NotFoundException('Poll not found');
    if (!poll.active) throw new BadRequestException('Poll is closed');
    const existing = await this.pollResponses.findOne({
      where: { pollId, attendeeId: dto.attendeeId },
    });
    if (existing) throw new ConflictException('Already responded to this poll');
    if (!poll.options.includes(dto.selectedOption))
      throw new BadRequestException('Invalid option selected');
    const response = this.pollResponses.create({
      pollId,
      attendeeId: dto.attendeeId,
      selectedOption: dto.selectedOption,
    });
    await this.pollResponses.save(response);
    await this.eventBus.publish('poll.responded', {
      eventType: 'poll.responded',
      tenantId,
      payload: { pollId, attendeeId: dto.attendeeId, selectedOption: dto.selectedOption },
    });
    return response;
  }

  async getPollResults(pollId: string) {
    const responses = await this.pollResponses.find({ where: { pollId } });
    const tally: Record<string, number> = {};
    for (const r of responses) {
      tally[r.selectedOption] = (tally[r.selectedOption] ?? 0) + 1;
    }
    return { pollId, total: responses.length, tally };
  }

  async listPolls(tenantId: string, eventId: string) {
    return this.polls.find({ where: { tenantId, eventId }, order: { createdAt: 'DESC' } });
  }

  async submitQuestion(tenantId: string, dto: SubmitQuestionDto) {
    const q = this.questions.create({ tenantId, ...dto });
    await this.questions.save(q);
    await this.eventBus.publish('qa.question_submitted', {
      eventType: 'qa.question_submitted',
      tenantId,
      payload: { questionId: q.id, sessionId: dto.sessionId, attendeeId: dto.attendeeId },
    });
    return q;
  }

  async upvoteQuestion(id: string) {
    const q = await this.questions.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Question not found');
    q.upvotes += 1;
    return this.questions.save(q);
  }

  async markAnswered(id: string) {
    const q = await this.questions.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Question not found');
    q.answered = true;
    return this.questions.save(q);
  }

  async listQuestions(sessionId: string) {
    return this.questions.find({
      where: { sessionId },
      order: { upvotes: 'DESC', createdAt: 'ASC' },
    });
  }

  async createSurvey(tenantId: string, dto: CreateSurveyDto) {
    const survey = this.surveys.create({ tenantId, ...dto });
    return this.surveys.save(survey);
  }

  async submitSurveyResponse(surveyId: string, tenantId: string, dto: SubmitSurveyResponseDto) {
    const survey = await this.surveys.findOne({ where: { id: surveyId } });
    if (!survey) throw new NotFoundException('Survey not found');
    if (!survey.active) throw new BadRequestException('Survey is closed');
    const existing = await this.surveyResponses.findOne({
      where: { surveyId, attendeeId: dto.attendeeId },
    });
    if (existing) throw new ConflictException('Already submitted this survey');
    const response = this.surveyResponses.create({
      surveyId,
      attendeeId: dto.attendeeId,
      answers: dto.answers,
    });
    await this.surveyResponses.save(response);
    await this.eventBus.publish('survey.completed', {
      eventType: 'survey.completed',
      tenantId,
      payload: { surveyId, attendeeId: dto.attendeeId, eventId: survey.eventId },
    });
    return response;
  }

  async listSurveys(tenantId: string, eventId: string) {
    return this.surveys.find({ where: { tenantId, eventId }, order: { createdAt: 'DESC' } });
  }
}
