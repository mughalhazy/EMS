import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';

import { RegistrationEntity } from './entities/registration.entity';

export const REGISTRATION_EVENTS_KAFKA_CLIENT = 'REGISTRATION_EVENTS_KAFKA_CLIENT';
export const REGISTRATION_CREATED_TOPIC = 'registration.created';
export const REGISTRATION_CONFIRMED_TOPIC = 'registration.confirmed';

@Injectable()
export class RegistrationEventsPublisher {
  private readonly logger = new Logger(RegistrationEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(REGISTRATION_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishRegistrationCreated(
    registration: Pick<RegistrationEntity, 'id' | 'tenantId' | 'eventId' | 'userId' | 'ticketId' | 'status'>,
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${REGISTRATION_CREATED_TOPIC}' for registration '${registration.id}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(REGISTRATION_CREATED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: registration.tenantId,
      registration_id: registration.id,
      event_id_ref: registration.eventId,
      user_id: registration.userId,
      ticket_id: registration.ticketId,
      status: registration.status,
    }, trace));
  }

  async publishRegistrationConfirmed(
    registration: Pick<RegistrationEntity, 'id' | 'tenantId' | 'eventId' | 'userId' | 'ticketId'>,
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        `Kafka client unavailable. Skipping publish to topic '${REGISTRATION_CONFIRMED_TOPIC}' for registration '${registration.id}'.`,
      );
      return;
    }

    await this.kafkaClient.emit(REGISTRATION_CONFIRMED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: registration.tenantId,
      registration_id: registration.id,
      event_id_ref: registration.eventId,
      user_id: registration.userId,
      ticket_id: registration.ticketId,
      status: 'confirmed',
    }, trace));
  }
}
