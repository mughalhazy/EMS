import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { AcceptConnectionRequestDto } from './dto/accept-connection-request.dto';
import { SendConnectionRequestDto } from './dto/send-connection-request.dto';
import { AttendeeConnectionEntity } from './entities/attendee-connection.entity';
import { NetworkingService } from './networking.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/networking/connections')
export class NetworkingController {
  constructor(private readonly networkingService: NetworkingService) {}

  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  async sendConnectionRequest(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: SendConnectionRequestDto,
  ): Promise<AttendeeConnectionEntity> {
    return this.networkingService.sendConnectionRequest(
      tenantId,
      eventId,
      payload.requesterAttendeeId,
      payload.recipientAttendeeId,
    );
  }

  @Patch('requests/:connectionId/accept')
  async acceptConnectionRequest(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('connectionId', ParseUUIDPipe) connectionId: string,
    @Body() payload: AcceptConnectionRequestDto,
  ): Promise<AttendeeConnectionEntity> {
    return this.networkingService.acceptConnectionRequest(
      tenantId,
      eventId,
      connectionId,
      payload.attendeeId,
    );
  }
}
