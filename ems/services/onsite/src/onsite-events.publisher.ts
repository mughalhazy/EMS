import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';

export const ONSITE_EVENTS_KAFKA_CLIENT = 'ONSITE_EVENTS_KAFKA_CLIENT';
export const ONSITE_CHECKIN_COMPLETED_TOPIC = 'onsite.checkin.completed';
export const SESSION_ATTENDANCE_SCANNED_TOPIC = 'session.attendance_scanned';
export const ONSITE_ACCESS_GRANTED_TOPIC = 'onsite.access.granted';
export const ONSITE_ACCESS_DENIED_TOPIC = 'onsite.access.denied';
export const ONSITE_BADGE_PRINTED_TOPIC = 'onsite.badge.printed';

@Injectable()
export class OnsiteEventsPublisher {
  private readonly logger = new Logger(OnsiteEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(ONSITE_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishOnsiteCheckInCompleted(payload: {
    tenantId: string;
    eventId: string;
    attendeeId: string;
    checkInId: string;
    deviceId: string;
    checkedInAt: Date;
  }, trace?: DistributedTraceCarrier): Promise<void> {
    await this.emitEvent(
      ONSITE_CHECKIN_COMPLETED_TOPIC,
      {
        event_id: randomUUID(),
        occurred_at: new Date().toISOString(),
        tenant_id: payload.tenantId,
        event_id_ref: payload.eventId,
        attendee_id: payload.attendeeId,
        check_in_id: payload.checkInId,
        device_id: payload.deviceId,
        checked_in_at: payload.checkedInAt.toISOString(),
      },
      trace,
      payload.attendeeId,
    );
  }

  async publishSessionAttendanceScanned(payload: {
    tenantId: string;
    eventId: string;
    attendeeId: string;
    sessionId: string;
    sessionCheckInId: string;
    deviceId: string;
    scannedAt: Date;
    accessGranted: boolean;
    denialReason: string | null;
  }, trace?: DistributedTraceCarrier): Promise<void> {
    await this.emitEvent(
      SESSION_ATTENDANCE_SCANNED_TOPIC,
      {
        event_id: randomUUID(),
        occurred_at: new Date().toISOString(),
        tenant_id: payload.tenantId,
        event_id_ref: payload.eventId,
        attendee_id: payload.attendeeId,
        session_id: payload.sessionId,
        session_check_in_id: payload.sessionCheckInId,
        device_id: payload.deviceId,
        scanned_at: payload.scannedAt.toISOString(),
        access_granted: payload.accessGranted,
        denial_reason: payload.denialReason,
      },
      trace,
      payload.attendeeId,
    );

    await this.emitEvent(
      payload.accessGranted ? ONSITE_ACCESS_GRANTED_TOPIC : ONSITE_ACCESS_DENIED_TOPIC,
      {
        event_id: randomUUID(),
        occurred_at: new Date().toISOString(),
        tenant_id: payload.tenantId,
        event_id_ref: payload.eventId,
        attendee_id: payload.attendeeId,
        session_id: payload.sessionId,
        session_check_in_id: payload.sessionCheckInId,
        device_id: payload.deviceId,
        scanned_at: payload.scannedAt.toISOString(),
        denial_reason: payload.denialReason,
      },
      trace,
      payload.attendeeId,
    );
  }


  async publishOnsiteBadgePrinted(payload: {
    tenantId: string;
    eventId: string;
    attendeeId: string;
    badgeId: string;
    deviceId: string;
    printedAt: Date | null;
    isReprint: boolean;
  }, trace?: DistributedTraceCarrier): Promise<void> {
    await this.emitEvent(
      ONSITE_BADGE_PRINTED_TOPIC,
      {
        event_id: randomUUID(),
        occurred_at: new Date().toISOString(),
        tenant_id: payload.tenantId,
        event_id_ref: payload.eventId,
        attendee_id: payload.attendeeId,
        badge_id: payload.badgeId,
        device_id: payload.deviceId,
        printed_at: payload.printedAt?.toISOString() ?? null,
        is_reprint: payload.isReprint,
      },
      trace,
      payload.attendeeId,
    );
  }

  private async emitEvent(
    topic: string,
    payload: Record<string, unknown>,
    trace: DistributedTraceCarrier | undefined,
    attendeeId: string,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'onsite.publish.skipped',
          reason: 'kafka_client_unavailable',
          topic,
          attendeeId,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(topic, attachDistributedTrace(payload, trace));
  }
}
