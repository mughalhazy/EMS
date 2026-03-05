import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { EventEntity, EventStatus } from './entities/event.entity';

@Injectable()
export class EventService {
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

    event.status = status;
    return this.eventRepository.save(event);
  }

  async remove(tenantId: string, eventId: string): Promise<boolean> {
    const result = await this.eventRepository.delete({ id: eventId, tenantId });
    return (result.affected ?? 0) > 0;
  }
}
