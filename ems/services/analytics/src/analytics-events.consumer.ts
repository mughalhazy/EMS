import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { readDistributedTrace } from '../../audit/src/distributed-tracing';

import { QUESTION_ASKED_TOPIC, POLL_SUBMITTED_TOPIC } from '../../engagement/src/engagement-events.publisher';
import { LEAD_CAPTURED_TOPIC } from '../../exhibitor/src/exhibitor-events.publisher';
import { ATTENDEE_CHECKED_IN_TOPIC } from '../../onsite/src/onsite-events.publisher';
import { REGISTRATION_CONFIRMED_TOPIC } from '../../registration/src/registration-events.publisher';
import {
  AnalyticsMetricsService,
  AttendeeCheckedInMetricEvent,
  LeadCapturedMetricEvent,
  RegistrationConfirmedMetricEvent,
  SessionAttendedMetricEvent,
  SessionEngagementMetricEvent,
} from './analytics-metrics.service';
import { SESSION_ATTENDED_TOPIC } from '../../agenda/src/session-attendance.publisher';

@Injectable()
export class AnalyticsEventsConsumer {
  private readonly logger = new Logger(AnalyticsEventsConsumer.name);

  constructor(private readonly analyticsMetricsService: AnalyticsMetricsService) {}

  @EventPattern(REGISTRATION_CONFIRMED_TOPIC)
  async handleRegistrationConfirmed(
    @Payload() payload: RegistrationConfirmedMetricEvent,
  ): Promise<void> {
    const trace = readDistributedTrace(payload as Record<string, unknown>);
    await this.analyticsMetricsService.handleRegistrationConfirmed(payload);
    this.logger.debug(
      `Processed registration confirmation metric for tenant '${payload.tenant_id}' and event '${payload.event_id_ref}'${trace?.trace_id ? ` (trace_id=${trace.trace_id})` : ''}.`,
    );
  }

  @EventPattern(ATTENDEE_CHECKED_IN_TOPIC)
  async handleAttendeeCheckedIn(@Payload() payload: AttendeeCheckedInMetricEvent): Promise<void> {
    const trace = readDistributedTrace(payload as Record<string, unknown>);
    await this.analyticsMetricsService.handleAttendeeCheckedIn(payload);
    this.logger.debug(
      `Processed attendee check-in metric for tenant '${payload.tenant_id}' and event '${payload.event_id_ref}'${trace?.trace_id ? ` (trace_id=${trace.trace_id})` : ''}.`,
    );
  }

  @EventPattern(SESSION_ATTENDED_TOPIC)
  async handleSessionAttended(@Payload() payload: SessionAttendedMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handleSessionAttended(payload);
    this.logger.debug(
      `Processed session attendance metric for tenant '${payload.tenant_id}', event '${payload.event_id_ref}', and session '${payload.session_id}'.`,
    );
  }

  @EventPattern(POLL_SUBMITTED_TOPIC)
  async handlePollSubmitted(@Payload() payload: SessionEngagementMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handlePollSubmitted(payload);
    this.logger.debug(
      `Processed poll engagement metric for tenant '${payload.tenant_id}', event '${payload.event_id_ref}', and session '${payload.session_id}'.`,
    );
  }

  @EventPattern(QUESTION_ASKED_TOPIC)
  async handleQuestionAsked(@Payload() payload: SessionEngagementMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handleQuestionAsked(payload);
    this.logger.debug(
      `Processed question engagement metric for tenant '${payload.tenant_id}', event '${payload.event_id_ref}', and session '${payload.session_id}'.`,
    );
  }

  @EventPattern(LEAD_CAPTURED_TOPIC)
  async handleLeadCaptured(@Payload() payload: LeadCapturedMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handleLeadCaptured(payload);
    this.logger.debug(
      `Processed lead capture metric for tenant '${payload.tenant_id}', event '${payload.event_id_ref}', and exhibitor '${payload.exhibitor_id}'.`,
    );
  }
}
