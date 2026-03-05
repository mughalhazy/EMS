import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { EventService } from './event.service';
import { EventSettingEntity, EventVisibility } from './entities/event-setting.entity';

@Injectable()
export class EventSettingService {
  constructor(
    @InjectRepository(EventSettingEntity)
    private readonly eventSettingRepository: Repository<EventSettingEntity>,
    private readonly eventService: EventService,
  ) {}

  async getOrCreateByTenantAndEventId(
    tenantId: string,
    eventId: string,
  ): Promise<EventSettingEntity | null> {
    const event = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!event) {
      return null;
    }

    const existingSettings = await this.eventSettingRepository.findOne({
      where: { tenantId, eventId },
    });

    if (existingSettings) {
      return existingSettings;
    }

    const settings = this.eventSettingRepository.create({
      tenantId,
      eventId,
      timezone: event.timezone,
      capacity: null,
      visibility: EventVisibility.PRIVATE,
    });

    return this.eventSettingRepository.save(settings);
  }

  async update(
    tenantId: string,
    eventId: string,
    input: DeepPartial<EventSettingEntity>,
  ): Promise<EventSettingEntity | null> {
    const settings = await this.getOrCreateByTenantAndEventId(tenantId, eventId);
    if (!settings) {
      return null;
    }

    if (input.timezone) {
      await this.eventService.update(tenantId, eventId, { timezone: input.timezone });
    }

    Object.assign(settings, input);
    return this.eventSettingRepository.save(settings);
  }
}
