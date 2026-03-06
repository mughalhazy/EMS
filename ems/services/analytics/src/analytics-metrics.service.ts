import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BoothEntity } from '../../exhibitor/src/entities/booth.entity';
import { EventAnalyticsEntity } from './entities/event-analytics.entity';
import { ExhibitorAnalyticsEntity } from './entities/exhibitor-analytics.entity';
import { SessionAnalyticsEntity } from './entities/session-analytics.entity';

export interface RegistrationConfirmedMetricEvent {
  tenant_id: string;
  event_id_ref: string;
  occurred_at?: string;
}

export interface AttendeeCheckedInMetricEvent {
  tenant_id: string;
  event_id_ref: string;
  checked_in_at?: string;
}

export interface SessionAttendedMetricEvent {
  tenant_id: string;
  event_id_ref: string;
  session_id: string;
  attended_at?: string;
  scanned_at?: string;
}

export interface SessionEngagementMetricEvent {
  tenant_id: string;
  event_id_ref: string;
  session_id: string;
  submitted_at?: string;
  asked_at?: string;
}

export interface LeadCapturedMetricEvent {
  tenant_id: string;
  event_id_ref: string;
  exhibitor_id: string;
  captured_at?: string;
}

@Injectable()
export class AnalyticsMetricsService {
  private readonly logger = new Logger(AnalyticsMetricsService.name);

  constructor(
    @InjectRepository(EventAnalyticsEntity)
    private readonly eventAnalyticsRepository: Repository<EventAnalyticsEntity>,
    @InjectRepository(SessionAnalyticsEntity)
    private readonly sessionAnalyticsRepository: Repository<SessionAnalyticsEntity>,
    @InjectRepository(ExhibitorAnalyticsEntity)
    private readonly exhibitorAnalyticsRepository: Repository<ExhibitorAnalyticsEntity>,
    @InjectRepository(BoothEntity)
    private readonly boothRepository: Repository<BoothEntity>,
  ) {}

  async handleRegistrationConfirmed(event: RegistrationConfirmedMetricEvent): Promise<void> {
    const snapshotDate = this.toDateString(event.occurred_at);
    const analytics = await this.getOrCreateEventAnalytics(event.tenant_id, event.event_id_ref, snapshotDate);

    analytics.registrationsCount += 1;
    analytics.ticketsSoldCount += 1;

    await this.eventAnalyticsRepository.save(analytics);
  }

  async handleAttendeeCheckedIn(event: AttendeeCheckedInMetricEvent): Promise<void> {
    const snapshotDate = this.toDateString(event.checked_in_at);
    const analytics = await this.getOrCreateEventAnalytics(event.tenant_id, event.event_id_ref, snapshotDate);

    analytics.attendeesCheckedInCount += 1;

    await this.eventAnalyticsRepository.save(analytics);
  }

  async handleSessionAttended(event: SessionAttendedMetricEvent): Promise<void> {
    const analytics = await this.getOrCreateSessionAnalytics(
      event.tenant_id,
      event.event_id_ref,
      event.session_id,
    );

    analytics.checkedInAttendees += 1;
    analytics.lastAttendanceAt = this.toDate(event.attended_at ?? event.scanned_at);
    analytics.engagementScore = this.computeEngagementScore(analytics);

    await this.sessionAnalyticsRepository.save(analytics);
  }

  async handlePollSubmitted(event: SessionEngagementMetricEvent): Promise<void> {
    await this.updateSessionEngagement(event, 'poll');
  }

  async handleQuestionAsked(event: SessionEngagementMetricEvent): Promise<void> {
    await this.updateSessionEngagement(event, 'question');
  }

  async handleLeadCaptured(event: LeadCapturedMetricEvent): Promise<void> {
    const metricDate = this.toDateString(event.captured_at);
    const booth = await this.boothRepository.findOne({
      where: {
        tenantId: event.tenant_id,
        eventId: event.event_id_ref,
        exhibitorId: event.exhibitor_id,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (!booth) {
      this.logger.warn(
        JSON.stringify({
          event: 'analytics.lead_capture.skipped',
          reason: 'booth_not_found',
          exhibitorId: event.exhibitor_id,
          eventId: event.event_id_ref,
        }),
      );
      return;
    }

    const analytics =
      (await this.exhibitorAnalyticsRepository.findOne({
        where: {
          boothId: booth.id,
          metricDate,
        },
      })) ??
      this.exhibitorAnalyticsRepository.create({
        tenantId: event.tenant_id,
        eventId: event.event_id_ref,
        exhibitorId: event.exhibitor_id,
        boothId: booth.id,
        metricDate,
        leadCapturesCount: 0,
        boothVisitsCount: 0,
      });

    analytics.leadCapturesCount += 1;

    await this.exhibitorAnalyticsRepository.save(analytics);
  }

  private async updateSessionEngagement(
    event: SessionEngagementMetricEvent,
    engagementType: 'poll' | 'question',
  ): Promise<void> {
    const analytics = await this.getOrCreateSessionAnalytics(
      event.tenant_id,
      event.event_id_ref,
      event.session_id,
    );

    if (engagementType === 'poll') {
      analytics.pollResponses += 1;
    } else {
      analytics.questionsAsked += 1;
    }

    analytics.totalEngagementActions += 1;
    analytics.lastEngagementAt = this.toDate(event.submitted_at ?? event.asked_at);
    analytics.engagementScore = this.computeEngagementScore(analytics);

    await this.sessionAnalyticsRepository.save(analytics);
  }

  private async getOrCreateEventAnalytics(
    tenantId: string,
    eventId: string,
    snapshotDate: string,
  ): Promise<EventAnalyticsEntity> {
    return (
      (await this.eventAnalyticsRepository.findOne({
        where: {
          tenantId,
          eventId,
          snapshotDate,
        },
      })) ??
      this.eventAnalyticsRepository.create({
        tenantId,
        eventId,
        snapshotDate,
        registrationsCount: 0,
        ticketsSoldCount: 0,
        ticketSalesAmount: '0.00',
        attendeesCheckedInCount: 0,
      })
    );
  }

  private async getOrCreateSessionAnalytics(
    tenantId: string,
    eventId: string,
    sessionId: string,
  ): Promise<SessionAnalyticsEntity> {
    return (
      (await this.sessionAnalyticsRepository.findOne({
        where: {
          tenantId,
          eventId,
          sessionId,
        },
      })) ??
      this.sessionAnalyticsRepository.create({
        tenantId,
        eventId,
        sessionId,
        registeredAttendees: 0,
        checkedInAttendees: 0,
        noShowAttendees: 0,
        pollResponses: 0,
        questionsAsked: 0,
        reactions: 0,
        totalEngagementActions: 0,
        engagementScore: '0.00',
        lastAttendanceAt: null,
        lastEngagementAt: null,
      })
    );
  }

  private computeEngagementScore(analytics: SessionAnalyticsEntity): string {
    const audienceSize = Math.max(analytics.checkedInAttendees, 1);
    const normalizedScore = Math.min((analytics.totalEngagementActions / audienceSize) * 100, 100);

    return normalizedScore.toFixed(2);
  }

  private toDateString(dateString?: string): string {
    return this.toDate(dateString).toISOString().slice(0, 10);
  }

  private toDate(dateString?: string): Date {
    if (!dateString) {
      return new Date();
    }

    const parsedDate = new Date(dateString);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }
}
