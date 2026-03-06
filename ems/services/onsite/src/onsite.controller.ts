import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CheckInAttendeeDto } from './dto/check-in-attendee.dto';
import { CheckInEntity } from './entities/check-in.entity';
import { OnsiteService } from './onsite.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/onsite')
export class OnsiteController {
  constructor(private readonly onsiteService: OnsiteService) {}

  @Post('check-ins')
  @HttpCode(HttpStatus.CREATED)
  async checkInAttendee(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CheckInAttendeeDto,
  ): Promise<CheckInEntity> {
    return this.onsiteService.checkInAttendee({
      tenantId,
      eventId,
      attendeeId: payload.attendeeId,
      qrCode: payload.qrCode,
      deviceId: payload.deviceId,
    });
  }
}
