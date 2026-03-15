import { UseInterceptors,
  BadRequestException,
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

import { AuditService } from '../../audit/src/audit.service';
import { CloneEventDto } from './dto/clone-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventEntity, EventStatus } from './entities/event.entity';
import { EventAgendaView, EventService } from './event.service';
import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';



type AgendaOrder = 'asc' | 'desc';

type PaginatedEventsResponse = {
  items: EventEntity[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

@UseInterceptors(ApiResponseInterceptor)
@Controller('api/v1/tenants/:tenantId/events')
export class EventController {
  constructor(
    private readonly eventService: EventService,
    private readonly auditService: AuditService,
  ) {}

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
        status: payload.status ?? EventStatus.DRAFT,
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


  @Get(':eventId/agenda')
  async getEventAgenda(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query('order') order?: AgendaOrder,
  ): Promise<EventAgendaView> {
    const normalizedOrder = (order ?? 'asc').toLowerCase();
    if (normalizedOrder !== 'asc' && normalizedOrder !== 'desc') {
      throw new BadRequestException("'order' must be either 'asc' or 'desc'.");
    }

    const agendaView = await this.eventService.findAgendaView(
      tenantId,
      eventId,
      normalizedOrder === 'asc' ? 'ASC' : 'DESC',
    );

    if (!agendaView) {
      throw new NotFoundException('Event not found in tenant.');
    }

    return agendaView;
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
    const existingEventById = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!existingEventById) {
      throw new NotFoundException('Event not found in tenant.');
    }

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

    const before = this.serializeEventForAudit(existingEventById);

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

    await this.auditService.trackEventChange({
      tenantId,
      action: 'event.updated',
      metadata: { eventId: event.id },
      before,
      after: this.serializeEventForAudit(event),
    });

    return event;
  }


  @Post(':eventId/publish')
  async publishEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventEntity> {
    const before = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!before) {
      throw new NotFoundException('Event not found in tenant.');
    }

    const event = await this.eventService.publish(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    await this.auditService.trackEventChange({
      tenantId,
      action: 'event.published',
      metadata: { eventId },
      before: this.serializeEventForAudit(before),
      after: this.serializeEventForAudit(event),
    });

    return event;
  }

  @Post(':eventId/unpublish')
  async unpublishEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventEntity> {
    const before = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!before) {
      throw new NotFoundException('Event not found in tenant.');
    }

    const event = await this.eventService.unpublish(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    await this.auditService.trackEventChange({
      tenantId,
      action: 'event.unpublished',
      metadata: { eventId },
      before: this.serializeEventForAudit(before),
      after: this.serializeEventForAudit(event),
    });

    return event;
  }

  @Post(':eventId/clone')
  @HttpCode(HttpStatus.CREATED)
  async cloneEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CloneEventDto,
  ): Promise<EventEntity> {
    const existingEvent = await this.eventService.findByTenantAndCode(tenantId, payload.code);
    if (existingEvent) {
      throw new ConflictException(
        `Event with code '${payload.code}' already exists in tenant.`,
      );
    }

    const event = await this.eventService.clone(tenantId, eventId, {
      code: payload.code,
      name: payload.name,
      startAt: payload.startAt ? new Date(payload.startAt) : undefined,
      endAt: payload.endAt ? new Date(payload.endAt) : undefined,
    });

    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    await this.auditService.trackEventChange({
      tenantId,
      action: 'event.cloned',
      metadata: { sourceEventId: eventId, clonedEventId: event.id },
      after: this.serializeEventForAudit(event),
    });

    return event;
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<void> {
    const event = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }

    const deleted = await this.eventService.remove(tenantId, eventId);
    if (!deleted) {
      throw new NotFoundException('Event not found in tenant.');
    }

    await this.auditService.trackEventChange({
      tenantId,
      action: 'event.deleted',
      metadata: { eventId },
      before: this.serializeEventForAudit(event),
    });
  }

  private serializeEventForAudit(event: EventEntity): Record<string, unknown> {
    return {
      id: event.id,
      tenantId: event.tenantId,
      organizationId: event.organizationId,
      name: event.name,
      code: event.code,
      description: event.description,
      timezone: event.timezone,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      status: event.status,
      agenda: event.agenda,
      settings: event.settings,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
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
