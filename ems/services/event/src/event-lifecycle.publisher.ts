import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { EventEntity } from './entities/event.entity';
import { SessionEntity } from './entities/session.entity';

export const EVENT_LIFECYCLE_TOPIC = 'event.lifecycle';
export const EVENT_LIFECYCLE_KAFKA_CLIENT = 'EVENT_LIFECYCLE_KAFKA_CLIENT';

export type EventLifecycleChangeType =
  | 'event.created'
  | 'event.updated'
  | 'event.status_changed'
  | 'event.deleted'
  | 'session.created'
  | 'session.updated';

type EventLifecycleEnvelope = {
  event_id: string;
  event_type: EventLifecycleChangeType;
  event_version: number;
  occurred_at: string;
  tenant_id: string;
  aggregate_type: 'event' | 'session';
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
    aggregate: Pick<EventEntity, 'id' | 'tenantId'> | Pick<SessionEntity, 'id' | 'tenantId'>,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const aggregateType = eventType.startsWith('session.') ? 'session' : 'event';
    const envelope: EventLifecycleEnvelope = {
      event_id: randomUUID(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      tenant_id: aggregate.tenantId,
      aggregate_type: aggregateType,
      aggregate_id: aggregate.id,
      payload,
    };

    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'event.lifecycle.publish.skipped',
          reason: 'kafka_client_unavailable',
          topic: EVENT_LIFECYCLE_TOPIC,
          aggregateId: aggregate.id,
          aggregateType,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(EVENT_LIFECYCLE_TOPIC, envelope);
  }
}
