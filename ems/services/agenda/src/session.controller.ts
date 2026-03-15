import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { AssignSpeakerDto } from './dto/assign-speaker.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { QueryAgendaDto } from './dto/query-agenda.dto';
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
      trackId: payload.trackId,
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
    @Query() query: QueryAgendaDto,
  ): Promise<SessionEntity[]> {
    return this.sessionService.queryAgenda(tenantId, eventId, {
      trackId: query.trackId,
      speakerId: query.speakerId,
      startsAfter: query.startsAfter ? new Date(query.startsAfter) : undefined,
      endsBefore: query.endsBefore ? new Date(query.endsBefore) : undefined,
      status: query.status,
      search: query.search,
    });
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
      trackId: payload.trackId,
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

  @Post(':sessionId/bookmarks/:attendeeId')
  async addBookmark(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('attendeeId', ParseUUIDPipe) attendeeId: string,
  ) {
    return this.sessionService.addToSchedule({ tenantId, eventId, sessionId, attendeeId });
  }

  @Get('bookmarks/:attendeeId')
  async listBookmarks(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('attendeeId', ParseUUIDPipe) attendeeId: string,
  ) {
    return this.sessionService.listSchedule(tenantId, eventId, attendeeId);
  }

  @Delete(':sessionId/bookmarks/:attendeeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeBookmark(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('attendeeId', ParseUUIDPipe) attendeeId: string,
  ): Promise<void> {
    const removed = await this.sessionService.removeFromSchedule(tenantId, eventId, attendeeId, sessionId);
    if (!removed) {
      throw new NotFoundException('Bookmark not found for attendee session.');
    }
  }
}
