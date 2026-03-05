import {
  Body,
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
} from '@nestjs/common';

import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionEntity } from './entities/session.entity';
import { EventService } from './event.service';
import { SessionService } from './session.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/sessions')
export class SessionController {
  constructor(
    private readonly eventService: EventService,
    private readonly sessionService: SessionService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSession(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateSessionDto,
  ): Promise<SessionEntity> {
    await this.ensureEventExists(tenantId, eventId);

    return this.sessionService.create({
      tenantId,
      eventId,
      roomId: payload.roomId ?? null,
      title: payload.title,
      abstract: payload.abstract ?? null,
      sessionType: payload.sessionType,
      startAt: new Date(payload.startAt),
      endAt: new Date(payload.endAt),
      capacity: payload.capacity ?? null,
      remainingSeats: payload.capacity ?? null,
      status: payload.status,
    });
  }

  @Get()
  async listSessions(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<SessionEntity[]> {
    await this.ensureEventExists(tenantId, eventId);
    return this.sessionService.findByTenantEvent(tenantId, eventId);
  }

  @Patch(':sessionId')
  async updateSession(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() payload: UpdateSessionDto,
  ): Promise<SessionEntity> {
    const session = await this.sessionService.update(tenantId, eventId, sessionId, {
      roomId: payload.roomId,
      title: payload.title,
      abstract: payload.abstract,
      sessionType: payload.sessionType,
      startAt: payload.startAt ? new Date(payload.startAt) : undefined,
      endAt: payload.endAt ? new Date(payload.endAt) : undefined,
      capacity: payload.capacity,
      status: payload.status,
    });

    if (!session) {
      throw new NotFoundException('Session not found in event.');
    }

    return session;
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSession(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<void> {
    const deleted = await this.sessionService.remove(tenantId, eventId, sessionId);

    if (!deleted) {
      throw new NotFoundException('Session not found in event.');
    }
  }

  private async ensureEventExists(tenantId: string, eventId: string): Promise<void> {
    const event = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }
  }
}
