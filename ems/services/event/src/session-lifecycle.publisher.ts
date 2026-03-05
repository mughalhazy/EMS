import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { SessionEntity } from './entities/session.entity';

export const SESSION_LIFECYCLE_TOPIC = 'session.lifecycle';
export const SESSION_LIFECYCLE_KAFKA_CLIENT = 'SESSION_LIFECYCLE_KAFKA_CLIENT';

export type SessionLifecycleChangeType = 'session.created' | 'session.updated';

type SessionLifecycleEnvelope = {
  event_id: string;
  event_type: SessionLifecycleChangeType;
  event_version: number;
  occurred_at: string;
  tenant_id: string;
  aggregate_type: 'session';
  aggregate_id: string;
  payload: Record<string, unknown>;
};

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
    session: Pick<SessionEntity, 'id' | 'tenantId'>,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const envelope: SessionLifecycleEnvelope = {
      event_id: randomUUID(),
      event_type: eventType,
      event_version: 1,
      occurred_at: new Date().toISOString(),
      tenant_id: session.tenantId,
      aggregate_type: 'session',
      aggregate_id: session.id,
      payload,
    };

    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${SESSION_LIFECYCLE_TOPIC}' for session '${session.id}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(SESSION_LIFECYCLE_TOPIC, envelope);
  }
}
