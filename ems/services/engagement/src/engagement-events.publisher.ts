import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';

import { SessionQnaEntity } from '../../agenda/src/entities/session-qna.entity';
import { PollEntity } from './entities/poll.entity';

export const ENGAGEMENT_EVENTS_KAFKA_CLIENT = 'ENGAGEMENT_EVENTS_KAFKA_CLIENT';
export const POLL_SUBMITTED_TOPIC = 'poll.submitted';
export const SURVEY_COMPLETED_TOPIC = 'survey.completed';
export const QUESTION_ASKED_TOPIC = 'session.question.asked';

@Injectable()
export class EngagementEventsPublisher {
  private readonly logger = new Logger(EngagementEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(ENGAGEMENT_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishPollSubmitted(
    poll: Pick<PollEntity, 'id' | 'tenantId' | 'eventId' | 'sessionId'>,
    payload: { attendeeId: string; option: string; submittedAt?: Date },
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${POLL_SUBMITTED_TOPIC}' for poll '${poll.id}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(POLL_SUBMITTED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: poll.tenantId,
      event_id_ref: poll.eventId,
      session_id: poll.sessionId,
      poll_id: poll.id,
      attendee_id: payload.attendeeId,
      selected_option: payload.option,
      submitted_at: (payload.submittedAt ?? new Date()).toISOString(),
    }, trace));
  }


  async publishQuestionAsked(
    question: Pick<SessionQnaEntity, 'id' | 'sessionId' | 'attendeeId' | 'createdAt'>,
    metadata: { tenantId: string; eventId: string },
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${QUESTION_ASKED_TOPIC}' for question '${question.id}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(QUESTION_ASKED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: metadata.tenantId,
      event_id_ref: metadata.eventId,
      question_id: question.id,
      session_id: question.sessionId,
      attendee_id: question.attendeeId,
      asked_at: question.createdAt.toISOString(),
    }, trace));
  }

  async publishSurveyCompleted(metadata: {
    tenantId: string;
    eventId: string;
    surveyId: string;
    attendeeId: string;
    completedAt?: Date;
  }, trace?: DistributedTraceCarrier): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${SURVEY_COMPLETED_TOPIC}' for survey '${metadata.surveyId}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(SURVEY_COMPLETED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: metadata.tenantId,
      event_id_ref: metadata.eventId,
      survey_id: metadata.surveyId,
      attendee_id: metadata.attendeeId,
      completed_at: (metadata.completedAt ?? new Date()).toISOString(),
    }, trace));
  }
}
