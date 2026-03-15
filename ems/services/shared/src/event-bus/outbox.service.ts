import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { DomainEvent } from './domain-event';
import { EventPublisher } from './event-publisher';
import { OutboxEventEntity, OutboxEventStatus } from './outbox-event.entity';

export type PublishPendingEventsResult = {
  published: number;
  failed: number;
};

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly outboxRepository: Repository<OutboxEventEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async enqueue<TPayload>(event: DomainEvent<TPayload>): Promise<OutboxEventEntity> {
    const outboxEvent = this.outboxRepository.create({
      id: event.id,
      eventType: event.type,
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      tenantId: event.tenantId,
      payload: (event.payload as Record<string, unknown>) ?? {},
      metadata: (event.metadata as Record<string, unknown>) ?? {},
      status: OutboxEventStatus.PENDING,
      attempts: 0,
      nextAttemptAt: null,
      publishedAt: null,
      lastError: null,
    });

    return this.outboxRepository.save(outboxEvent);
  }

  async enqueueMany<TPayload>(events: DomainEvent<TPayload>[]): Promise<OutboxEventEntity[]> {
    const outboxEvents = events.map((event) =>
      this.outboxRepository.create({
        id: event.id,
        eventType: event.type,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        tenantId: event.tenantId,
        payload: (event.payload as Record<string, unknown>) ?? {},
        metadata: (event.metadata as Record<string, unknown>) ?? {},
        status: OutboxEventStatus.PENDING,
      }),
    );

    return this.outboxRepository.save(outboxEvents);
  }

  async reservePending(limit = 100): Promise<OutboxEventEntity[]> {
    return this.dataSource.transaction(async (manager) => {
      const candidates = await manager
        .getRepository(OutboxEventEntity)
        .createQueryBuilder('outbox_event')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('outbox_event.status IN (:...statuses)', {
          statuses: [OutboxEventStatus.PENDING, OutboxEventStatus.FAILED],
        })
        .andWhere('(outbox_event.nextAttemptAt IS NULL OR outbox_event.nextAttemptAt <= NOW())')
        .orderBy('outbox_event.createdAt', 'ASC')
        .limit(limit)
        .getMany();

      if (candidates.length === 0) {
        return [];
      }

      const candidateIds = candidates.map((candidate) => candidate.id);

      await manager.getRepository(OutboxEventEntity).update(
        { id: In(candidateIds) },
        {
          status: OutboxEventStatus.PROCESSING,
          attempts: () => 'attempts + 1',
          nextAttemptAt: null,
          lastError: null,
        },
      );

      return manager.getRepository(OutboxEventEntity).find({
        where: {
          id: In(candidateIds),
        },
        order: {
          createdAt: 'ASC',
        },
      });
    });
  }

  async publishPending(
    publisher: EventPublisher,
    limit = 100,
    retryDelayMs = 15_000,
  ): Promise<PublishPendingEventsResult> {
    const pendingEvents = await this.reservePending(limit);
    let published = 0;
    let failed = 0;

    for (const pendingEvent of pendingEvents) {
      try {
        await publisher.publish({
          id: pendingEvent.id,
          type: pendingEvent.eventType,
          aggregateType: pendingEvent.aggregateType,
          aggregateId: pendingEvent.aggregateId,
          tenantId: pendingEvent.tenantId,
          occurredAt: pendingEvent.createdAt.toISOString(),
          payload: pendingEvent.payload,
          metadata: pendingEvent.metadata,
          partitionKey: pendingEvent.aggregateId,
        });

        pendingEvent.status = OutboxEventStatus.PUBLISHED;
        pendingEvent.publishedAt = new Date();
        pendingEvent.nextAttemptAt = null;
        pendingEvent.lastError = null;
        await this.outboxRepository.save(pendingEvent);
        published += 1;
      } catch (error) {
        pendingEvent.status = OutboxEventStatus.FAILED;
        pendingEvent.nextAttemptAt = new Date(Date.now() + retryDelayMs);
        pendingEvent.lastError = error instanceof Error ? error.message : 'Unknown publish error';
        await this.outboxRepository.save(pendingEvent);

        this.logger.error(
          JSON.stringify({
            event: 'outbox.publish.failed',
            outboxEventId: pendingEvent.id,
            eventType: pendingEvent.eventType,
            tenantId: pendingEvent.tenantId,
            attempts: pendingEvent.attempts,
            nextAttemptAt: pendingEvent.nextAttemptAt.toISOString(),
            error: pendingEvent.lastError,
          }),
        );
        failed += 1;
      }
    }

    return { published, failed };
  }

  async requeueStaleProcessing(staleAfterMs = 60_000): Promise<number> {
    const staleBefore = new Date(Date.now() - staleAfterMs);
    const result = await this.outboxRepository
      .createQueryBuilder()
      .update(OutboxEventEntity)
      .set({
        status: OutboxEventStatus.PENDING,
        nextAttemptAt: null,
        lastError: 'processing_timeout_requeued',
      })
      .where('status = :status', { status: OutboxEventStatus.PROCESSING })
      .andWhere('updatedAt < :staleBefore', { staleBefore })
      .execute();

    return result.affected ?? 0;
  }

  async requeueFailed(limit = 100): Promise<number> {
    const failedEvents = await this.outboxRepository.find({
      where: { status: OutboxEventStatus.FAILED },
      take: limit,
      order: { updatedAt: 'ASC' },
    });

    for (const failedEvent of failedEvents) {
      failedEvent.status = OutboxEventStatus.PENDING;
      failedEvent.nextAttemptAt = null;
      await this.outboxRepository.save(failedEvent);
    }

    return failedEvents.length;
  }
}
