import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

export const ONSITE_EVENTS_KAFKA_CLIENT = 'ONSITE_EVENTS_KAFKA_CLIENT';
export const ATTENDEE_CHECKED_IN_TOPIC = 'attendee.checked_in';

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
  }): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${ATTENDEE_CHECKED_IN_TOPIC}' for attendee '${payload.attendeeId}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(ATTENDEE_CHECKED_IN_TOPIC, {
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: payload.tenantId,
      event_id_ref: payload.eventId,
      attendee_id: payload.attendeeId,
      check_in_id: payload.checkInId,
      device_id: payload.deviceId,
      checked_in_at: payload.checkedInAt.toISOString(),
    });
  }
}
