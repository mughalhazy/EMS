import { UseInterceptors,
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
} from '@nestjs/common';

import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { SpeakerEntity, SpeakerStatus } from './entities/speaker.entity';
import { EventService } from './event.service';
import { SpeakerService } from './speaker.service';
import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';

@UseInterceptors(ApiResponseInterceptor)
@Controller('api/v1/tenants/:tenantId/events/:eventId/speakers')
export class SpeakerController {
  constructor(
    private readonly eventService: EventService,
    private readonly speakerService: SpeakerService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSpeaker(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateSpeakerDto,
  ): Promise<SpeakerEntity> {
    await this.ensureEventExists(tenantId, eventId);

    if (payload.email) {
      const existing = await this.speakerService.findByTenantEventAndEmail(
        tenantId,
        eventId,
        payload.email,
      );

      if (existing) {
        throw new ConflictException(
          `Speaker with email '${payload.email}' already exists in event.`,
        );
      }
    }

    return this.speakerService.create({
      tenantId,
      eventId,
      organizationId: payload.organizationId ?? null,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email ?? null,
      bio: payload.bio ?? null,
      headline: payload.headline ?? null,
      companyName: payload.companyName ?? null,
      photoUrl: payload.photoUrl ?? null,
      websiteUrl: payload.websiteUrl ?? null,
      linkedinUrl: payload.linkedinUrl ?? null,
      xUrl: payload.xUrl ?? null,
      githubUrl: payload.githubUrl ?? null,
      locationLabel: payload.locationLabel ?? null,
      expertiseTags: payload.expertiseTags ?? [],
      status: payload.status ?? SpeakerStatus.INVITED,
    });
  }

  @Get()
  async listSpeakers(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<SpeakerEntity[]> {
    await this.ensureEventExists(tenantId, eventId);
    return this.speakerService.findByTenantAndEvent(tenantId, eventId);
  }

  @Get(':speakerId')
  async getSpeaker(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('speakerId', ParseUUIDPipe) speakerId: string,
  ): Promise<SpeakerEntity> {
    const speaker = await this.speakerService.findByTenantEventAndId(
      tenantId,
      eventId,
      speakerId,
    );

    if (!speaker) {
      throw new NotFoundException('Speaker not found in event.');
    }

    return speaker;
  }

  @Patch(':speakerId')
  async updateSpeaker(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('speakerId', ParseUUIDPipe) speakerId: string,
    @Body() payload: UpdateSpeakerDto,
  ): Promise<SpeakerEntity> {
    if (payload.email) {
      const existing = await this.speakerService.findByTenantEventAndEmail(
        tenantId,
        eventId,
        payload.email,
      );

      if (existing && existing.id !== speakerId) {
        throw new ConflictException(
          `Speaker with email '${payload.email}' already exists in event.`,
        );
      }
    }

    const speaker = await this.speakerService.update(tenantId, eventId, speakerId, {
      organizationId: payload.organizationId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      bio: payload.bio,
      headline: payload.headline,
      companyName: payload.companyName,
      photoUrl: payload.photoUrl,
      websiteUrl: payload.websiteUrl,
      linkedinUrl: payload.linkedinUrl,
      xUrl: payload.xUrl,
      githubUrl: payload.githubUrl,
      locationLabel: payload.locationLabel,
      expertiseTags: payload.expertiseTags,
      status: payload.status,
    });

    if (!speaker) {
      throw new NotFoundException('Speaker not found in event.');
    }

    return speaker;
  }

  @Delete(':speakerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSpeaker(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('speakerId', ParseUUIDPipe) speakerId: string,
  ): Promise<void> {
    const deleted = await this.speakerService.remove(tenantId, eventId, speakerId);

    if (!deleted) {
      throw new NotFoundException('Speaker not found in event.');
    }
  }

  private async ensureEventExists(tenantId: string, eventId: string): Promise<void> {
    const event = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }
  }
}
