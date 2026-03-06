import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { AttendeeConnectionEntity } from './entities/attendee-connection.entity';

export const NETWORKING_EVENTS_KAFKA_CLIENT = 'NETWORKING_EVENTS_KAFKA_CLIENT';
export const ATTENDEE_CONNECTED_TOPIC = 'attendee.connected';

@Injectable()
export class NetworkingEventsPublisher {
  private readonly logger = new Logger(NetworkingEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(NETWORKING_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishAttendeeConnected(
    connection: Pick<AttendeeConnectionEntity, 'id' | 'attendeeAId' | 'attendeeBId' | 'updatedAt'>,
    metadata: { tenantId: string; eventId: string },
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${ATTENDEE_CONNECTED_TOPIC}' for connection '${connection.id}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(ATTENDEE_CONNECTED_TOPIC, {
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: metadata.tenantId,
      event_id_ref: metadata.eventId,
      connection_id: connection.id,
      attendee_a_id: connection.attendeeAId,
      attendee_b_id: connection.attendeeBId,
      connected_at: connection.updatedAt.toISOString(),
    });
  }
}
