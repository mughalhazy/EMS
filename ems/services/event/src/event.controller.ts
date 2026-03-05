import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity } from './entities/event.entity';
import { EventService } from './event.service';

type PaginatedEventsResponse = {
  items: EventEntity[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

@Controller('api/v1/tenants/:tenantId/events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: CreateEventDto,
  ): Promise<EventEntity> {
    await this.ensureTenantOwnsTemplateEvent(tenantId, payload.templateEventId);

    const existingEvent = await this.eventService.findByTenantAndCode(
      tenantId,
      payload.code,
    );

    if (existingEvent) {
      throw new ConflictException(
        `Event with code '${payload.code}' already exists in tenant.`,
      );
    }

    return this.eventService.create(
      {
        tenantId,
        organizationId: payload.organizationId,
        name: payload.name,
        code: payload.code,
        description: payload.description ?? null,
        timezone: payload.timezone,
        startAt: new Date(payload.startAt),
        endAt: new Date(payload.endAt),
        status: payload.status,
        agenda: payload.agenda,
        settings: payload.settings,
      },
    );
  }

  @Get()
  async listEvents(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() query: ListEventsQueryDto,
  ): Promise<PaginatedEventsResponse> {
    const page = Math.max(Number.parseInt(query.page ?? '1', 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number.parseInt(query.pageSize ?? '20', 10) || 20, 1),
      100,
    );

    const [items, totalItems] = await this.eventService.findByTenantPaginated(
      tenantId,
      page,
      pageSize,
    );

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize),
    };
  }

  @Get(':eventId')
  async getEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventEntity> {
    const event = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    return event;
  }

  @Patch(':eventId')
  async updateEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: UpdateEventDto,
  ): Promise<EventEntity> {
    if (payload.code) {
      const existingEvent = await this.eventService.findByTenantAndCode(
        tenantId,
        payload.code,
      );

      if (existingEvent && existingEvent.id !== eventId) {
        throw new ConflictException(
          `Event with code '${payload.code}' already exists in tenant.`,
        );
      }
    }

    const event = await this.eventService.update(tenantId, eventId, {
      organizationId: payload.organizationId,
      name: payload.name,
      code: payload.code,
      description: payload.description,
      timezone: payload.timezone,
      startAt: payload.startAt ? new Date(payload.startAt) : undefined,
      endAt: payload.endAt ? new Date(payload.endAt) : undefined,
      status: payload.status,
      agenda: payload.agenda,
      settings: payload.settings,
    });

    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    return event;
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<void> {
    const deleted = await this.eventService.remove(tenantId, eventId);
    if (!deleted) {
      throw new NotFoundException('Event not found in tenant.');
    }
  }

  private async ensureTenantOwnsTemplateEvent(
    tenantId: string,
    templateEventId?: string,
  ): Promise<void> {
    if (!templateEventId) {
      return;
    }

    const templateEvent = await this.eventService.findByTenantAndId(
      tenantId,
      templateEventId,
    );

    if (!templateEvent) {
      throw new NotFoundException('Template event not found in tenant.');
    }
  }
}
