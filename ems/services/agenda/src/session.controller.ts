import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';

import { AssignSpeakerDto } from './dto/assign-speaker.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionEntity } from './entities/session.entity';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SessionService } from './session.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateSessionDto,
  ): Promise<SessionEntity> {
    return this.sessionService.create({
      tenantId,
      eventId,
      roomId: payload.roomId,
      title: payload.title,
      description: payload.description ?? null,
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
      capacity: payload.capacity,
      agendaOrder: payload.agendaOrder,
      status: payload.status,
    });
  }

  @Get()
  async list(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<SessionEntity[]> {
    return this.sessionService.list(tenantId, eventId);
  }

  @Patch(':sessionId')
  async update(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() payload: UpdateSessionDto,
  ): Promise<SessionEntity | null> {
    return this.sessionService.update(tenantId, eventId, sessionId, {
      roomId: payload.roomId,
      title: payload.title,
      description: payload.description,
      startTime: payload.startTime ? new Date(payload.startTime) : undefined,
      endTime: payload.endTime ? new Date(payload.endTime) : undefined,
      capacity: payload.capacity,
      agendaOrder: payload.agendaOrder,
      status: payload.status,
    });
  }

  @Post(':sessionId/speakers')
  async assignSpeaker(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() payload: AssignSpeakerDto,
  ): Promise<SessionSpeakerEntity> {
    return this.sessionService.assignSpeaker({ tenantId, eventId, sessionId, speakerId: payload.speakerId });
  }
}
