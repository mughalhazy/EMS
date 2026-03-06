import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { SearchAttendeeDirectoryQueryDto } from './dto/search-attendee-directory-query.dto';
import { AttendeeDirectoryEntry, AttendeeService } from './attendee.service';

@Controller('tenants/:tenantId/events/:eventId/attendees')
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
}
