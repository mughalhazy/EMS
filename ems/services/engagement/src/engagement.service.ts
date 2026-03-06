import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionQnaEntity } from '../../agenda/src/entities/session-qna.entity';
import { SessionEntity } from '../../agenda/src/entities/session.entity';
import { AuditService } from '../../audit/src/audit.service';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { SurveyEntity } from '../../event/src/entities/survey.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { PollEntity } from './entities/poll.entity';
import { EngagementEventsPublisher } from './engagement-events.publisher';

@Injectable()
export class EngagementService {
  constructor(
    @InjectRepository(PollEntity)
    private readonly pollRepository: Repository<PollEntity>,
    @InjectRepository(SessionQnaEntity)
    private readonly questionRepository: Repository<SessionQnaEntity>,
    @InjectRepository(SurveyEntity)
    private readonly surveyRepository: Repository<SurveyEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepository: Repository<AttendeeEntity>,
    private readonly engagementEventsPublisher: EngagementEventsPublisher,
    private readonly auditService: AuditService,
  ) {}

  async createPoll(tenantId: string, eventId: string, payload: CreatePollDto): Promise<PollEntity> {
    await this.assertSessionBelongsToTenantEvent(tenantId, eventId, payload.sessionId);
    this.assertScheduleWindow(payload.startsAt, payload.endsAt);

    const poll = this.pollRepository.create({
      tenantId,
      eventId,
      sessionId: payload.sessionId,
      question: payload.question.trim(),
      options: payload.options.map((option) => option.trim()),
      status: payload.status,
      startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
      endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
    });

    return this.pollRepository.save(poll);
  }

  async listPolls(tenantId: string, eventId: string): Promise<PollEntity[]> {
    return this.pollRepository.find({
      where: { tenantId, eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async submitPoll(
    tenantId: string,
    eventId: string,
    pollId: string,
    payload: { attendeeId: string; option: string },
  ): Promise<{ status: string }> {
    const poll = await this.pollRepository.findOne({ where: { id: pollId, tenantId, eventId } });
    if (!poll) {
      throw new NotFoundException('Poll not found.');
    }

    const attendee = await this.attendeeRepository.findOne({
      where: { id: payload.attendeeId, tenantId, eventId },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found for the provided tenant and event.');
    }

    if (!poll.options.includes(payload.option)) {
      throw new BadRequestException('Selected poll option is invalid.');
    }

    await this.engagementEventsPublisher.publishPollSubmitted(poll, {
      attendeeId: payload.attendeeId,
      option: payload.option,
    });

    await this.auditService.trackEventChange({
      tenantId,
      actorUserId: attendee.userId,
      action: 'engagement.poll.submitted',
      after: { pollId: poll.id, attendeeId: attendee.id, option: payload.option, sessionId: poll.sessionId },
    });

    return { status: 'submitted' };
  }

  async updatePoll(tenantId: string, eventId: string, pollId: string, payload: UpdatePollDto): Promise<PollEntity> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId, tenantId, eventId },
    });

    if (!poll) {
      throw new NotFoundException('Poll not found.');
    }

    if (payload.sessionId) {
      await this.assertSessionBelongsToTenantEvent(tenantId, eventId, payload.sessionId);
      poll.sessionId = payload.sessionId;
    }

    if (payload.question !== undefined) {
      poll.question = payload.question.trim();
    }

    if (payload.options !== undefined) {
      poll.options = payload.options.map((option) => option.trim());
    }

    if (payload.status !== undefined) {
      poll.status = payload.status;
    }

    const startsAt = payload.startsAt === undefined ? poll.startsAt : payload.startsAt ? new Date(payload.startsAt) : null;
    const endsAt = payload.endsAt === undefined ? poll.endsAt : payload.endsAt ? new Date(payload.endsAt) : null;

    this.assertScheduleWindow(startsAt, endsAt);

    poll.startsAt = startsAt;
    poll.endsAt = endsAt;

    return this.pollRepository.save(poll);
  }

  async createQuestion(
    tenantId: string,
    eventId: string,
    payload: CreateQuestionDto,
  ): Promise<SessionQnaEntity> {
    await this.assertSessionBelongsToTenantEvent(tenantId, eventId, payload.sessionId);

    const attendee = await this.attendeeRepository.findOne({
      where: {
        id: payload.attendeeId,
        tenantId,
        eventId,
      },
    });

    if (!attendee) {
      throw new NotFoundException('Attendee not found for the provided tenant and event.');
    }

    const question = this.questionRepository.create({
      sessionId: payload.sessionId,
      attendeeId: payload.attendeeId,
      question: payload.question.trim(),
    });

    const savedQuestion = await this.questionRepository.save(question);
    await this.auditService.trackEventChange({
      tenantId,
      actorUserId: attendee.userId,
      action: 'engagement.question.asked',
      after: { questionId: savedQuestion.id, sessionId: savedQuestion.sessionId, attendeeId: savedQuestion.attendeeId },
    });

    return savedQuestion;
  }

  async listQuestions(tenantId: string, eventId: string, sessionId?: string): Promise<SessionQnaEntity[]> {
    if (sessionId) {
      await this.assertSessionBelongsToTenantEvent(tenantId, eventId, sessionId);
      return this.questionRepository.find({
        where: { sessionId },
        order: { createdAt: 'DESC' },
      });
    }

    const sessions = await this.sessionRepository.find({
      where: { tenantId, eventId },
      select: { id: true },
    });

    const sessionIds = sessions.map((session) => session.id);

    if (!sessionIds.length) {
      return [];
    }

    return this.questionRepository
      .createQueryBuilder('question')
      .where('question.session_id IN (:...sessionIds)', { sessionIds })
      .orderBy('question.created_at', 'DESC')
      .getMany();
  }

  async createSurvey(tenantId: string, eventId: string, payload: CreateSurveyDto): Promise<SurveyEntity> {
    this.assertScheduleWindow(payload.openAt, payload.closeAt);

    const existingSurvey = await this.surveyRepository.findOne({
      where: {
        tenantId,
        eventId,
        code: payload.code,
      },
    });

    if (existingSurvey) {
      throw new ConflictException(`Survey code '${payload.code}' already exists for this event.`);
    }

    const survey = this.surveyRepository.create({
      tenantId,
      eventId,
      code: payload.code,
      title: payload.title.trim(),
      description: payload.description?.trim() ?? null,
      status: payload.status,
      isAnonymous: payload.isAnonymous,
      openAt: payload.openAt ? new Date(payload.openAt) : null,
      closeAt: payload.closeAt ? new Date(payload.closeAt) : null,
      questions: payload.questions ?? null,
      settings: payload.settings ?? null,
    });

    return this.surveyRepository.save(survey);
  }

  async completeSurvey(
    tenantId: string,
    eventId: string,
    surveyId: string,
    payload: { attendeeId: string },
  ): Promise<{ status: string }> {
    const survey = await this.surveyRepository.findOne({ where: { id: surveyId, tenantId, eventId } });
    if (!survey) {
      throw new NotFoundException('Survey not found.');
    }

    const attendee = await this.attendeeRepository.findOne({
      where: { id: payload.attendeeId, tenantId, eventId },
    });
    if (!attendee) {
      throw new NotFoundException('Attendee not found for the provided tenant and event.');
    }

    await this.engagementEventsPublisher.publishSurveyCompleted({
      tenantId,
      eventId,
      surveyId,
      attendeeId: attendee.id,
    });

    await this.auditService.trackEventChange({
      tenantId,
      actorUserId: attendee.userId,
      action: 'engagement.survey.completed',
      after: { surveyId: survey.id, attendeeId: attendee.id },
    });

    return { status: 'completed' };
  }

  async listSurveys(tenantId: string, eventId: string): Promise<SurveyEntity[]> {
    return this.surveyRepository.find({
      where: { tenantId, eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSurvey(
    tenantId: string,
    eventId: string,
    surveyId: string,
    payload: UpdateSurveyDto,
  ): Promise<SurveyEntity> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId, tenantId, eventId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found.');
    }

    if (payload.title !== undefined) {
      survey.title = payload.title.trim();
    }

    if (payload.description !== undefined) {
      survey.description = payload.description.trim();
    }

    if (payload.status !== undefined) {
      survey.status = payload.status;
    }

    if (payload.isAnonymous !== undefined) {
      survey.isAnonymous = payload.isAnonymous;
    }

    if (payload.questions !== undefined) {
      survey.questions = payload.questions;
    }

    if (payload.settings !== undefined) {
      survey.settings = payload.settings;
    }

    const openAt = payload.openAt === undefined ? survey.openAt : payload.openAt ? new Date(payload.openAt) : null;
    const closeAt = payload.closeAt === undefined ? survey.closeAt : payload.closeAt ? new Date(payload.closeAt) : null;

    this.assertScheduleWindow(openAt, closeAt);

    survey.openAt = openAt;
    survey.closeAt = closeAt;

    return this.surveyRepository.save(survey);
  }

  private async assertSessionBelongsToTenantEvent(
    tenantId: string,
    eventId: string,
    sessionId: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        tenantId,
        eventId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found for the provided tenant and event.');
    }
  }

  private assertScheduleWindow(openAt?: string | Date | null, closeAt?: string | Date | null): void {
    if (!openAt || !closeAt) {
      return;
    }

    const openAtDate = openAt instanceof Date ? openAt : new Date(openAt);
    const closeAtDate = closeAt instanceof Date ? closeAt : new Date(closeAt);

    if (openAtDate.getTime() >= closeAtDate.getTime()) {
      throw new BadRequestException('Schedule window is invalid: start time must be before end time.');
    }
  }
}
