import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';

export const ONSITE_EVENTS_KAFKA_CLIENT = 'ONSITE_EVENTS_KAFKA_CLIENT';
export const ATTENDEE_CHECKED_IN_TOPIC = 'attendee.checked_in';
export const SESSION_ATTENDED_TOPIC = 'session.attended';

@Injectable()
export class OnsiteEventsPublisher {
  private readonly logger = new Logger(OnsiteEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(ONSITE_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishAttendeeCheckedIn(payload: {
    tenantId: string;
    eventId: string;
    attendeeId: string;
    checkInId: string;
    deviceId: string;
    checkedInAt: Date;
  }, trace?: DistributedTraceCarrier): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${ATTENDEE_CHECKED_IN_TOPIC}' for attendee '${payload.attendeeId}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(ATTENDEE_CHECKED_IN_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: payload.tenantId,
      event_id_ref: payload.eventId,
      attendee_id: payload.attendeeId,
      check_in_id: payload.checkInId,
      device_id: payload.deviceId,
      checked_in_at: payload.checkedInAt.toISOString(),
    }, trace));
  }

  async publishSessionAttended(payload: {
    tenantId: string;
    eventId: string;
    attendeeId: string;
    sessionId: string;
    sessionCheckInId: string;
    deviceId: string;
    scannedAt: Date;
  }, trace?: DistributedTraceCarrier): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${SESSION_ATTENDED_TOPIC}' for attendee '${payload.attendeeId}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(SESSION_ATTENDED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: payload.tenantId,
      event_id_ref: payload.eventId,
      attendee_id: payload.attendeeId,
      session_id: payload.sessionId,
      session_check_in_id: payload.sessionCheckInId,
      device_id: payload.deviceId,
      scanned_at: payload.scannedAt.toISOString(),
    }, trace));
  }
}
