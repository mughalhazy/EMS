import { UseInterceptors, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';

import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { SpeakerEntity } from './entities/speaker.entity';
import { SpeakerService } from './speaker.service';
import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';

@UseInterceptors(ApiResponseInterceptor)
@Controller('api/v1/tenants/:tenantId/events/:eventId/speakers')
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Post()
  async create(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateSpeakerDto,
  ): Promise<SpeakerEntity> {
    return this.speakerService.create({ tenantId, eventId, ...payload, status: payload.status ?? undefined });
  }

  @Get()
  async list(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<SpeakerEntity[]> {
    return this.speakerService.list(tenantId, eventId);
  }

  @Patch(':speakerId')
  async update(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('speakerId', ParseUUIDPipe) speakerId: string,
    @Body() payload: UpdateSpeakerDto,
  ): Promise<SpeakerEntity | null> {
    return this.speakerService.update(tenantId, eventId, speakerId, payload);
  }
}
