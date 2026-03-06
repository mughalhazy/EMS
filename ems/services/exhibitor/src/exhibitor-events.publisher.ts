import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

import { attachDistributedTrace, DistributedTraceCarrier } from '../../audit/src/distributed-tracing';

import { ExhibitorLeadCaptureEntity } from './entities/exhibitor-lead-capture.entity';
import { ExhibitorEntity } from './entities/exhibitor.entity';

export const EXHIBITOR_EVENTS_KAFKA_CLIENT = 'EXHIBITOR_EVENTS_KAFKA_CLIENT';
export const EXHIBITOR_CREATED_TOPIC = 'exhibitor.created';
export const LEAD_CAPTURED_TOPIC = 'lead.captured';

@Injectable()
export class ExhibitorEventsPublisher {
  private readonly logger = new Logger(ExhibitorEventsPublisher.name);

  constructor(
    @Optional()
    @Inject(EXHIBITOR_EVENTS_KAFKA_CLIENT)
    private readonly kafkaClient?: ClientKafka,
  ) {}

  async publishExhibitorCreated(
    exhibitor: Pick<ExhibitorEntity, 'id' | 'tenantId' | 'eventId' | 'name'>,
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'exhibitor.publish.skipped',
          reason: 'kafka_client_unavailable',
          topic: EXHIBITOR_CREATED_TOPIC,
          exhibitorId: exhibitor.id,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(EXHIBITOR_CREATED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: exhibitor.tenantId,
      event_id_ref: exhibitor.eventId,
      exhibitor_id: exhibitor.id,
      exhibitor_name: exhibitor.name,
    }, trace));
  }

  async publishLeadCaptured(
    lead: Pick<ExhibitorLeadCaptureEntity, 'attendeeId' | 'exhibitorId' | 'capturedAt'>,
    metadata: { tenantId: string; eventId: string },
    trace?: DistributedTraceCarrier,
  ): Promise<void> {
    if (!this.kafkaClient) {
      this.logger.warn(
        JSON.stringify({
          event: 'exhibitor.publish.skipped',
          reason: 'kafka_client_unavailable',
          topic: LEAD_CAPTURED_TOPIC,
          exhibitorId: lead.exhibitorId,
          attendeeId: lead.attendeeId,
        }),
      );
      return;
    }

    await this.kafkaClient.emit(LEAD_CAPTURED_TOPIC, attachDistributedTrace({
      event_id: randomUUID(),
      occurred_at: new Date().toISOString(),
      tenant_id: metadata.tenantId,
      event_id_ref: metadata.eventId,
      exhibitor_id: lead.exhibitorId,
      attendee_id: lead.attendeeId,
      captured_at: lead.capturedAt.toISOString(),
    }, trace));
  }
}
