import { UseInterceptors,
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';

import { UpdateEventSettingDto } from './dto/update-event-setting.dto';
import { EventSettingEntity } from './entities/event-setting.entity';
import { EventSettingService } from './event-setting.service';
import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';

@UseInterceptors(ApiResponseInterceptor)
@Controller('api/v1/tenants/:tenantId/events/:eventId/settings')
export class EventSettingController {
  constructor(private readonly eventSettingService: EventSettingService) {}

  @Get()
  async getSettings(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<EventSettingEntity> {
    const settings = await this.eventSettingService.getOrCreateByTenantAndEventId(
      tenantId,
      eventId,
    );

    if (!settings) {
      throw new NotFoundException('Event not found in tenant.');
    }

    return settings;
  }

  @Patch()
  async updateSettings(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: UpdateEventSettingDto,
  ): Promise<EventSettingEntity> {
    if (typeof payload.capacity === 'number' && payload.capacity < 0) {
      throw new BadRequestException('Capacity cannot be negative.');
    }

    const settings = await this.eventSettingService.update(tenantId, eventId, {
      timezone: payload.timezone,
      capacity: payload.capacity,
      visibility: payload.visibility,
    });

    if (!settings) {
      throw new NotFoundException('Event not found in tenant.');
    }

    return settings;
  }
}
