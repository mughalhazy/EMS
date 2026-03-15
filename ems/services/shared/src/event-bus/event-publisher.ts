import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { DomainEvent } from './domain-event';

export const EVENT_BUS_KAFKA_CLIENT = 'EVENT_BUS_KAFKA_CLIENT';

export interface EventPublisher {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
  publishBatch<TPayload>(events: DomainEvent<TPayload>[]): Promise<void>;
}

@Injectable()
export class KafkaEventPublisher implements EventPublisher {
  private readonly logger = new Logger(KafkaEventPublisher.name);

  constructor(
    @Optional()
    @Inject(EVENT_BUS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'event_bus.publish.skipped',
          reason: 'kafka_client_unavailable',
          eventType: event.type,
          domainEventId: event.id,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(event.type, {
      eventId: event.id,
      eventType: event.type,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      tenantId: event.tenantId,
      occurredAt: event.occurredAt,
      payload: event.payload,
      metadata: event.metadata ?? {},
      partitionKey: event.partitionKey ?? event.aggregateId,
    });
  }

  async publishBatch<TPayload>(events: DomainEvent<TPayload>[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}
