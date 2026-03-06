import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';

import { SessionEntity } from './entities/session.entity';

export const SESSION_LIFECYCLE_TOPIC = 'session.lifecycle';
export const SESSION_LIFECYCLE_KAFKA_CLIENT = 'SESSION_LIFECYCLE_KAFKA_CLIENT';

type SessionLifecycleChangeType = 'session.created' | 'session.updated';

@Injectable()
export class SessionLifecyclePublisher {
  private readonly logger = new Logger(SessionLifecyclePublisher.name);

  constructor(
    @Optional()
    @Inject(SESSION_LIFECYCLE_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publish(
    eventType: SessionLifecycleChangeType,
    session: SessionEntity,
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(`Kafka unavailable. Skipping ${eventType} for session ${session.id}.`);
      return;
    }

    await this.kafkaClient.emit(SESSION_LIFECYCLE_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      event_type: eventType,
      occurred_at: new Date().toISOString(),
      tenant_id: session.tenantId,
      aggregate_type: 'session',
      aggregate_id: session.id,
      payload: {
        event_id_ref: session.eventId,
        room_id: session.roomId,
        start_time: session.startTime.toISOString(),
        end_time: session.endTime.toISOString(),
        capacity: session.capacity,
        agenda_order: session.agendaOrder,
      },
    }, trace));
  }
}
