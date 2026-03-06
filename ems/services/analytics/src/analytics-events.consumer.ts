import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

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
    await this.analyticsMetricsService.handleRegistrationConfirmed(payload);
    this.logger.debug(
      JSON.stringify({
        event: 'analytics.metric.processed',
        metricType: 'registration.confirmed',
        tenantId: payload.tenant_id,
        eventId: payload.event_id_ref,
      }),
    );
  }

  @EventPattern(ATTENDEE_CHECKED_IN_TOPIC)
  async handleAttendeeCheckedIn(@Payload() payload: AttendeeCheckedInMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handleAttendeeCheckedIn(payload);
    this.logger.debug(
      JSON.stringify({
        event: 'analytics.metric.processed',
        metricType: 'attendee.checked_in',
        tenantId: payload.tenant_id,
        eventId: payload.event_id_ref,
      }),
    );
  }

  @EventPattern(SESSION_ATTENDED_TOPIC)
  async handleSessionAttended(@Payload() payload: SessionAttendedMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handleSessionAttended(payload);
    this.logger.debug(
      JSON.stringify({
        event: 'analytics.metric.processed',
        metricType: 'session.attended',
        tenantId: payload.tenant_id,
        eventId: payload.event_id_ref,
        sessionId: payload.session_id,
      }),
    );
  }

  @EventPattern(POLL_SUBMITTED_TOPIC)
  async handlePollSubmitted(@Payload() payload: SessionEngagementMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handlePollSubmitted(payload);
    this.logger.debug(
      JSON.stringify({
        event: 'analytics.metric.processed',
        metricType: 'poll.submitted',
        tenantId: payload.tenant_id,
        eventId: payload.event_id_ref,
        sessionId: payload.session_id,
      }),
    );
  }

  @EventPattern(QUESTION_ASKED_TOPIC)
  async handleQuestionAsked(@Payload() payload: SessionEngagementMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handleQuestionAsked(payload);
    this.logger.debug(
      JSON.stringify({
        event: 'analytics.metric.processed',
        metricType: 'question.asked',
        tenantId: payload.tenant_id,
        eventId: payload.event_id_ref,
        sessionId: payload.session_id,
      }),
    );
  }

  @EventPattern(LEAD_CAPTURED_TOPIC)
  async handleLeadCaptured(@Payload() payload: LeadCapturedMetricEvent): Promise<void> {
    await this.analyticsMetricsService.handleLeadCaptured(payload);
    this.logger.debug(
      JSON.stringify({
        event: 'analytics.metric.processed',
        metricType: 'lead.captured',
        tenantId: payload.tenant_id,
        eventId: payload.event_id_ref,
        exhibitorId: payload.exhibitor_id,
      }),
    );
  }
}
