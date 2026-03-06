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
import { ScanSessionCheckInDto } from './dto/scan-session-check-in.dto';
import { CheckInResult, OnsiteService, SessionScanResult } from './onsite.service';

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

  @Post('sessions/:sessionId/scans')
  @HttpCode(HttpStatus.CREATED)
  async scanSessionCheckIn(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() payload: ScanSessionCheckInDto,
  ): Promise<SessionScanResult> {
    return this.onsiteService.scanSessionCheckIn(
      tenantId,
      eventId,
      sessionId,
      payload.attendeeId,
      payload.deviceId,
    );
  }
}
