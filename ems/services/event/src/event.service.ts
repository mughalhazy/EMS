import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { EventEntity, EventStatus } from './entities/event.entity';
import { SessionEntity } from './entities/session.entity';
import { VenueEntity } from './entities/venue.entity';
import { EventSearchIndexService } from './event-search-index.service';
import { EventLifecyclePublisher } from './event-lifecycle.publisher';

export type SessionAgendaView = {
  id: string;
  title: string;
  abstract: string | null;
  sessionType: string;
  status: string;
  startAt: Date;
  endAt: Date;
  room: {
    id: string;
    name: string;
  } | null;
};

export type EventAgendaView = {
  event: EventEntity;
  sessions: SessionAgendaView[];
};

@Injectable()
export class EventService {
  private static readonly ALLOWED_STATUS_TRANSITIONS: Readonly<
    Record<EventStatus, ReadonlyArray<EventStatus>>
  > = {
    [EventStatus.DRAFT]: [EventStatus.PUBLISHED],
    [EventStatus.PUBLISHED]: [EventStatus.DRAFT, EventStatus.LIVE, EventStatus.ARCHIVED],
    [EventStatus.LIVE]: [EventStatus.ARCHIVED],
    [EventStatus.ARCHIVED]: [],
  };

  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectRepository(VenueEntity)
    private readonly venueRepository: Repository<VenueEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    private readonly eventSearchIndexService: EventSearchIndexService,
    private readonly eventLifecyclePublisher: EventLifecyclePublisher,
  ) {}

  async findAgendaView(
    tenantId: string,
    eventId: string,
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<EventAgendaView | null> {
    const event = await this.findByTenantAndId(tenantId, eventId);
    if (!event) {
      return null;
    }

    const sessions = await this.sessionRepository.find({
      where: { tenantId, eventId },
      relations: { room: true },
      order: { startAt: order, endAt: order, createdAt: order },
    });

    return {
      event,
      sessions: sessions.map((session) => ({
        id: session.id,
        title: session.title,
        abstract: session.abstract,
        sessionType: session.sessionType,
        status: session.status,
        startAt: session.startAt,
        endAt: session.endAt,
        room: session.room
          ? {
              id: session.room.id,
              name: session.room.name,
            }
          : null,
      })),
    };
  }

  async create(input: DeepPartial<EventEntity>): Promise<EventEntity> {
    const event = this.eventRepository.create(input);
    const savedEvent = await this.eventRepository.save(event);
    await this.reindexSearchDocument(savedEvent.tenantId, savedEvent.id);
    await this.eventLifecyclePublisher.publish('event.created', savedEvent, {
      status: savedEvent.status,
      name: savedEvent.name,
      code: savedEvent.code,
      startAt: savedEvent.startAt.toISOString(),
      endAt: savedEvent.endAt.toISOString(),
    });
    return savedEvent;
  }

  async findByTenant(tenantId: string): Promise<EventEntity[]> {
    return this.eventRepository.find({
      where: { tenantId },
      order: { startAt: 'ASC' },
    });
  }

  async findByTenantPaginated(
    tenantId: string,
    page: number,
    pageSize: number,
  ): Promise<[EventEntity[], number]> {
    const offset = (page - 1) * pageSize;

    return this.eventRepository.findAndCount({
      where: { tenantId },
      order: { startAt: 'ASC' },
      skip: offset,
      take: pageSize,
    });
  }

  async findByTenantAndId(
    tenantId: string,
    eventId: string,
  ): Promise<EventEntity | null> {
    return this.eventRepository.findOne({
      where: { id: eventId, tenantId },
    });
  }

  async findByTenantAndCode(
    tenantId: string,
    code: string,
  ): Promise<EventEntity | null> {
    return this.eventRepository.findOne({
      where: { tenantId, code },
    });
  }

  async updateStatus(
    tenantId: string,
    eventId: string,
    status: EventStatus,
  ): Promise<EventEntity | null> {
    const event = await this.findByTenantAndId(tenantId, eventId);
    if (!event) {
      return null;
    }

    return this.transitionStatus(event, status);
  }

  async publish(tenantId: string, eventId: string): Promise<EventEntity | null> {
    return this.updateStatus(tenantId, eventId, EventStatus.PUBLISHED);
  }

  async unpublish(tenantId: string, eventId: string): Promise<EventEntity | null> {
    return this.updateStatus(tenantId, eventId, EventStatus.DRAFT);
  }


  async clone(
    tenantId: string,
    sourceEventId: string,
    input: {
      code: string;
      name?: string;
      startAt?: Date;
      endAt?: Date;
    },
  ): Promise<EventEntity | null> {
    const sourceEvent = await this.findByTenantAndId(tenantId, sourceEventId);
    if (!sourceEvent) {
      return null;
    }

    const clonedEvent = await this.create({
      tenantId: sourceEvent.tenantId,
      organizationId: sourceEvent.organizationId,
      name: input.name ?? `${sourceEvent.name} (Copy)`,
      code: input.code,
      description: sourceEvent.description,
      timezone: sourceEvent.timezone,
      startAt: input.startAt ?? sourceEvent.startAt,
      endAt: input.endAt ?? sourceEvent.endAt,
      status: EventStatus.DRAFT,
      agenda: sourceEvent.agenda,
      settings: sourceEvent.settings,
    });

    return clonedEvent;
  }

  async update(
    tenantId: string,
    eventId: string,
    input: DeepPartial<EventEntity>,
  ): Promise<EventEntity | null> {
    const event = await this.findByTenantAndId(tenantId, eventId);
    if (!event) {
      return null;
    }

    const previousStatus = event.status;
    Object.assign(event, input);
    const updatedEvent = await this.eventRepository.save(event);
    await this.reindexSearchDocument(updatedEvent.tenantId, updatedEvent.id);
    await this.eventLifecyclePublisher.publish('event.updated', updatedEvent, {
      previousStatus,
      status: updatedEvent.status,
      updatedFields: Object.keys(input),
    });
    return updatedEvent;
  }

  async remove(tenantId: string, eventId: string): Promise<boolean> {
    const result = await this.eventRepository.delete({ id: eventId, tenantId });
    if ((result.affected ?? 0) > 0) {
      await this.eventSearchIndexService.deleteEvent(eventId);
      await this.eventLifecyclePublisher.publish(
        'event.deleted',
        { id: eventId, tenantId },
        { deleted: true },
      );
    }
    return (result.affected ?? 0) > 0;
  }

  async reindexSearchDocument(tenantId: string, eventId: string): Promise<void> {
    const event = await this.findByTenantAndId(tenantId, eventId);
    if (!event) {
      return;
    }

    const venues = await this.venueRepository.find({
      where: { tenantId, eventId },
      order: { createdAt: 'DESC' },
    });

    await this.eventSearchIndexService.upsertEvent(event, venues);
  }

  private async transitionStatus(
    event: EventEntity,
    nextStatus: EventStatus,
  ): Promise<EventEntity> {
    if (event.status === nextStatus) {
      return event;
    }

    const allowedTransitions = EventService.ALLOWED_STATUS_TRANSITIONS[event.status] ?? [];
    if (!allowedTransitions.includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot transition event status from '${event.status}' to '${nextStatus}'.`,
      );
    }

    const previousStatus = event.status;
    event.status = nextStatus;
    const updatedEvent = await this.eventRepository.save(event);
    await this.reindexSearchDocument(updatedEvent.tenantId, updatedEvent.id);
    await this.eventLifecyclePublisher.publish('event.status_changed', updatedEvent, {
      previousStatus,
      status: nextStatus,
    });
    return updatedEvent;
  }
}
