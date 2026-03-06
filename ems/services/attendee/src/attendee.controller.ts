import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { SearchAttendeeDirectoryQueryDto } from './dto/search-attendee-directory-query.dto';
import {
  AttendeeConnectionView,
  AttendeeDirectoryEntry,
  AttendeePortalProfile,
  AttendeeScheduleItem,
  AttendeeService,
} from './attendee.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Get('directory/search')
  async searchDirectory(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: SearchAttendeeDirectoryQueryDto,
  ): Promise<AttendeeDirectoryEntry[]> {
    const limit = query.limit ? Number.parseInt(query.limit, 10) : undefined;

    return this.attendeeService.searchDirectory(tenantId, eventId, query.q ?? '', limit);
  }

  @Get(':attendeeId/profile')
  async getPortalProfile(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('attendeeId', ParseUUIDPipe) attendeeId: string,
  ): Promise<AttendeePortalProfile> {
    return this.attendeeService.getPortalProfile(tenantId, eventId, attendeeId);
  }

  @Get(':attendeeId/connections')
  async listPortalConnections(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('attendeeId', ParseUUIDPipe) attendeeId: string,
  ): Promise<AttendeeConnectionView[]> {
    return this.attendeeService.listPortalConnections(tenantId, eventId, attendeeId);
  }

  @Get(':attendeeId/schedule')
  async listPortalSchedule(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('attendeeId', ParseUUIDPipe) attendeeId: string,
  ): Promise<AttendeeScheduleItem[]> {
    return this.attendeeService.listPortalSchedule(tenantId, eventId, attendeeId);
  }
}
