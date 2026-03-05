import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { EventEntity } from './entities/event.entity';

export const EVENT_LIFECYCLE_TOPIC = 'event.lifecycle';
export const EVENT_LIFECYCLE_KAFKA_CLIENT = 'EVENT_LIFECYCLE_KAFKA_CLIENT';

export type EventLifecycleChangeType =
  | 'event.created'
  | 'event.updated'
  | 'event.status_changed'
  | 'event.deleted';

type EventLifecycleEnvelope = {
  event_id: string;
  event_type: EventLifecycleChangeType;
  event_version: number;
  occurred_at: string;
  tenant_id: string;
  aggregate_type: 'event';
  aggregate_id: string;
  payload: Record<string, unknown>;
};

@Injectable()
export class EventLifecyclePublisher {
  private readonly logger = new Logger(EventLifecyclePublisher.name);

  constructor(
    @Optional()
    @Inject(EVENT_LIFECYCLE_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publish(
    eventType: EventLifecycleChangeType,
    event: Pick<EventEntity, 'id' | 'tenantId'>,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const envelope: EventLifecycleEnvelope = {
      event_id: randomUUID(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      tenant_id: event.tenantId,
      aggregate_type: 'event',
      aggregate_id: event.id,
      payload,
    };

    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${EVENT_LIFECYCLE_TOPIC}' for event '${event.id}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(EVENT_LIFECYCLE_TOPIC, envelope);
  }
}
