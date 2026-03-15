import { Injectable, Logger } from '@nestjs/common';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';
import { createDomainEvent, OutboxService } from '../../shared/src/event-bus';

import { RegistrationEntity } from './entities/registration.entity';

export const REGISTRATION_STARTED_TOPIC = 'registration.started';
export const REGISTRATION_CONFIRMED_TOPIC = 'registration.confirmed';
export const REGISTRATION_CANCELLED_TOPIC = 'registration.cancelled';

@Injectable()
export class RegistrationEventsPublisher {
  private readonly logger = new Logger(RegistrationEventsPublisher.name);

  constructor(private readonly outboxService: OutboxService) {}

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
    const eventPayload = attachDistributedTrace(
      {
        event_id_ref: registration.eventId,
        registration_id: registration.id,
        status: registration.status,
        ticket_id: registration.ticketId,
        user_id: registration.userId,
      },
      trace,
    );

    await this.outboxService.enqueue(
      createDomainEvent({
        id: `${registration.id}:${topic}`,
        type: topic,
        aggregateType: 'registration',
        aggregateId: registration.id,
        tenantId: registration.tenantId,
        payload: eventPayload,
        metadata: {
          traceId: trace?.trace_id,
          spanId: trace?.span_id,
          parentSpanId: trace?.parent_span_id,
        },
        partitionKey: registration.id,
      }),
    );

    this.logger.debug(
      JSON.stringify({
        event: 'registration.outbox.enqueued',
        topic,
        registrationId: registration.id,
        tenantId: registration.tenantId,
      }),
    );
  }
}
