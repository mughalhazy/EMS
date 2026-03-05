import {
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';

import { EventEntity, EventStatus } from './entities/event.entity';
import { EventService } from './event.service';

@Controller('api/v1/tenants/:tenantId/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Patch(':eventId/publish')
  @HttpCode(HttpStatus.OK)
  async publishEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventEntity> {
    const event = await this.eventService.publish(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    return event;
  }

  @Patch(':eventId/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublishEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventEntity> {
    const event = await this.eventService.unpublish(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    return event;
  }
}
