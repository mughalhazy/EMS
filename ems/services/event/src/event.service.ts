import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { EventEntity, EventStatus } from './entities/event.entity';

@Injectable()
export class EventService {
  private static readonly ALLOWED_STATUS_TRANSITIONS: Readonly<
    Record<EventStatus, ReadonlyArray<EventStatus>>
  > = {
    [EventStatus.DRAFT]: [EventStatus.PUBLISHED],
    [EventStatus.PUBLISHED]: [EventStatus.DRAFT, EventStatus.LIVE, EventStatus.CANCELLED],
    [EventStatus.LIVE]: [EventStatus.COMPLETED, EventStatus.CANCELLED],
    [EventStatus.COMPLETED]: [],
    [EventStatus.CANCELLED]: [],
  };

  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
  ) {}

  async create(input: DeepPartial<EventEntity>): Promise<EventEntity> {
    const event = this.eventRepository.create(input);
    return this.eventRepository.save(event);
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

  async update(
    tenantId: string,
    eventId: string,
    input: DeepPartial<EventEntity>,
  ): Promise<EventEntity | null> {
    const event = await this.findByTenantAndId(tenantId, eventId);
    if (!event) {
      return null;
    }

    Object.assign(event, input);
    return this.eventRepository.save(event);
  }

  async remove(tenantId: string, eventId: string): Promise<boolean> {
    const result = await this.eventRepository.delete({ id: eventId, tenantId });
    return (result.affected ?? 0) > 0;
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

    event.status = nextStatus;
    return this.eventRepository.save(event);
  }
}
