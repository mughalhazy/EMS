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
  Post,
} from '@nestjs/common';

import { AssignSpeakerDto } from './dto/assign-speaker.dto';
import { SessionSpeakerEntity } from './entities/session-speaker.entity';
import { SpeakerAssignmentService } from './speaker-assignment.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId')
export class SpeakerAssignmentController {
  constructor(private readonly speakerAssignmentService: SpeakerAssignmentService) {}

  @Get('sessions/:sessionId/speakers')
  async listSpeakersForSession(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<SessionSpeakerEntity[]> {
    await this.ensureSessionExists(tenantId, eventId, sessionId);
    return this.speakerAssignmentService.listSpeakersForSession(tenantId, eventId, sessionId);
  }

  @Get('speakers/:speakerId/sessions')
  async listSessionsForSpeaker(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('speakerId', ParseUUIDPipe) speakerId: string,
  ): Promise<SessionSpeakerEntity[]> {
    await this.ensureSpeakerExists(tenantId, eventId, speakerId);
    return this.speakerAssignmentService.listSessionsForSpeaker(tenantId, eventId, speakerId);
  }

  @Post('sessions/:sessionId/speakers')
  @HttpCode(HttpStatus.CREATED)
  async assignSpeakerToSession(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() payload: AssignSpeakerDto,
  ): Promise<SessionSpeakerEntity> {
    await this.ensureSessionExists(tenantId, eventId, sessionId);
    await this.ensureSpeakerExists(tenantId, eventId, payload.speakerId);

    return this.speakerAssignmentService.assignSpeakerToSession({
      tenantId,
      eventId,
      sessionId,
      speakerId: payload.speakerId,
    });
  }

  @Delete('sessions/:sessionId/speakers/:speakerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignSpeakerFromSession(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Param('speakerId', ParseUUIDPipe) speakerId: string,
  ): Promise<void> {
    const removed = await this.speakerAssignmentService.unassignSpeakerFromSession(
      tenantId,
      eventId,
      sessionId,
      speakerId,
    );

    if (!removed) {
      throw new NotFoundException('Speaker assignment not found in session.');
    }
  }

  private async ensureSessionExists(
    tenantId: string,
    eventId: string,
    sessionId: string,
  ): Promise<void> {
    const session = await this.speakerAssignmentService.findSession(
      tenantId,
      eventId,
      sessionId,
    );

    if (!session) {
      throw new NotFoundException('Session not found in event.');
    }
  }

  private async ensureSpeakerExists(
    tenantId: string,
    eventId: string,
    speakerId: string,
  ): Promise<void> {
    const speaker = await this.speakerAssignmentService.findSpeaker(
      tenantId,
      eventId,
      speakerId,
    );

    if (!speaker) {
      throw new NotFoundException('Speaker not found in event.');
    }
  }
}
