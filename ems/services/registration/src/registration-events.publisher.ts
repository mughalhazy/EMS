import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';

import { RegistrationEntity } from './entities/registration.entity';

export const REGISTRATION_EVENTS_KAFKA_CLIENT = 'REGISTRATION_EVENTS_KAFKA_CLIENT';
export const REGISTRATION_STARTED_TOPIC = 'registration.started';
export const REGISTRATION_CONFIRMED_TOPIC = 'registration.confirmed';
export const REGISTRATION_CANCELLED_TOPIC = 'registration.cancelled';

@Injectable()
export class RegistrationEventsPublisher {
  private readonly logger = new Logger(RegistrationEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(REGISTRATION_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishRegistrationStarted(
    registration: Pick<RegistrationEntity, 'id' | 'tenantId' | 'eventId' | 'userId' | 'ticketId' | 'status'>,
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    await this.publishEvent(REGISTRATION_STARTED_TOPIC, registration, trace);
  }

  async publishRegistrationConfirmed(
    registration: Pick<RegistrationEntity, 'id' | 'tenantId' | 'eventId' | 'userId' | 'ticketId'>,
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    await this.publishEvent(
      REGISTRATION_CONFIRMED_TOPIC,
      { ...registration, status: 'confirmed' },
      trace,
    );
  }

  async publishRegistrationCancelled(
    registration: Pick<RegistrationEntity, 'id' | 'tenantId' | 'eventId' | 'userId' | 'ticketId'>,
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    await this.publishEvent(
      REGISTRATION_CANCELLED_TOPIC,
      { ...registration, status: 'cancelled' },
      trace,
    );
  }

  private async publishEvent(
    topic: string,
    registration: {
      id: string;
      tenantId: string;
      eventId: string;
      userId: string;
      ticketId: string;
      status: string;
    },
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'registration.publish.skipped',
          reason: 'kafka_client_unavailable',
          topic,
          registrationId: registration.id,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(
      topic,
      attachDistributedTrace(
        {
          event_id: randomUUID(),
          occurred_at: new Date().toISOString(),
          tenant_id: registration.tenantId,
          registration_id: registration.id,
          event_id_ref: registration.eventId,
          user_id: registration.userId,
          ticket_id: registration.ticketId,
          status: registration.status,
        },
        trace,
      ),
    );
  }
}
