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
  Patch,
  Post,
} from '@nestjs/common';

import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { VenueEntity } from './entities/venue.entity';
import { EventService } from './event.service';
import { VenueService } from './venue.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/venues')
export class VenueController {
  constructor(
    private readonly eventService: EventService,
    private readonly venueService: VenueService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVenue(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateVenueDto,
  ): Promise<VenueEntity> {
    await this.ensureEventExists(tenantId, eventId);

    const venue = await this.venueService.create({
      tenantId,
      eventId,
      name: payload.name,
      type: payload.type,
      addressLine1: payload.addressLine1 ?? null,
      city: payload.city ?? null,
      country: payload.country ?? null,
      virtualUrl: payload.virtualUrl ?? null,
      capacity: payload.capacity ?? null,
    });

    await this.eventService.reindexSearchDocument(tenantId, eventId);
    return venue;
  }

  @Get()
  async listVenues(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<VenueEntity[]> {
    await this.ensureEventExists(tenantId, eventId);
    return this.venueService.findByTenantAndEvent(tenantId, eventId);
  }

  @Get(':venueId')
  async getVenue(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
  ): Promise<VenueEntity> {
    const venue = await this.venueService.findByTenantEventAndId(
      tenantId,
      eventId,
      venueId,
    );

    if (!venue) {
      throw new NotFoundException('Venue not found in event.');
    }

    return venue;
  }

  @Patch(':venueId')
  async updateVenue(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @Body() payload: UpdateVenueDto,
  ): Promise<VenueEntity> {
    const venue = await this.venueService.update(tenantId, eventId, venueId, payload);

    if (!venue) {
      throw new NotFoundException('Venue not found in event.');
    }

    await this.eventService.reindexSearchDocument(tenantId, eventId);
    return venue;
  }

  @Delete(':venueId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVenue(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
  ): Promise<void> {
    const deleted = await this.venueService.remove(tenantId, eventId, venueId);

    if (!deleted) {
      throw new NotFoundException('Venue not found in event.');
    }

    await this.eventService.reindexSearchDocument(tenantId, eventId);
  }

  private async ensureEventExists(tenantId: string, eventId: string): Promise<void> {
    const event = await this.eventService.findByTenantAndId(tenantId, eventId);
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }
  }
}
