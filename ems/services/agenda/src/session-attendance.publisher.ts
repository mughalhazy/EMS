import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

export const SESSION_ATTENDANCE_KAFKA_CLIENT = 'SESSION_ATTENDANCE_KAFKA_CLIENT';
export const SESSION_ATTENDED_TOPIC = 'session.attended';

@Injectable()
export class SessionAttendancePublisher {
  private readonly logger = new Logger(SessionAttendancePublisher.name);

  constructor(
    @Optional()
    @Inject(SESSION_ATTENDANCE_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishSessionAttended(payload: {
    tenantId: string;
    eventId: string;
    sessionId: string;
    attendeeId: string;
    attendedAt?: Date;
  }): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${SESSION_ATTENDED_TOPIC}' for session '${payload.sessionId}' and attendee '${payload.attendeeId}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(SESSION_ATTENDED_TOPIC, {
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: payload.tenantId,
      event_id_ref: payload.eventId,
      session_id: payload.sessionId,
      attendee_id: payload.attendeeId,
      attended_at: (payload.attendedAt ?? new Date()).toISOString(),
    });
  }
}
