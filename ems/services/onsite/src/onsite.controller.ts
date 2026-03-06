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
import { CheckInResult, OnsiteService } from './onsite.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/check-ins')
export class OnsiteController {
  constructor(private readonly onsiteService: OnsiteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async checkInAttendee(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CheckInAttendeeDto,
  ): Promise<CheckInResult> {
    return this.onsiteService.checkInAttendee(
      tenantId,
      eventId,
      payload.attendeeId,
      payload.deviceId,
    );
  }
}
