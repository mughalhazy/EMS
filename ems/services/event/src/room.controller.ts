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

import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomEntity } from './entities/room.entity';
import { RoomService } from './room.service';
import { VenueService } from './venue.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/venues/:venueId/rooms')
export class RoomController {
  constructor(
    private readonly venueService: VenueService,
    private readonly roomService: RoomService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @Body() payload: CreateRoomDto,
  ): Promise<RoomEntity> {
    await this.ensureVenueExists(tenantId, eventId, venueId);

    return this.roomService.create({
      tenantId,
      eventId,
      venueId,
      name: payload.name,
      floor: payload.floor ?? null,
      capacity: payload.capacity,
    });
  }

  @Get()
  async listRooms(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
  ): Promise<RoomEntity[]> {
    await this.ensureVenueExists(tenantId, eventId, venueId);
    return this.roomService.findByTenantEventAndVenue(tenantId, eventId, venueId);
  }

  @Get(':roomId')
  async getRoom(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ): Promise<RoomEntity> {
    const room = await this.roomService.findByTenantEventVenueAndId(
      tenantId,
      eventId,
      venueId,
      roomId,
    );

    if (!room) {
      throw new NotFoundException('Room not found in venue.');
    }

    return room;
  }

  @Patch(':roomId')
  async updateRoom(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() payload: UpdateRoomDto,
  ): Promise<RoomEntity> {
    const room = await this.roomService.update(
      tenantId,
      eventId,
      venueId,
      roomId,
      payload,
    );

    if (!room) {
      throw new NotFoundException('Room not found in venue.');
    }

    return room;
  }

  @Delete(':roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRoom(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @Param('roomId', ParseUUIDPipe) roomId: string,
  ): Promise<void> {
    const deleted = await this.roomService.remove(tenantId, eventId, venueId, roomId);

    if (!deleted) {
      throw new NotFoundException('Room not found in venue.');
    }
  }

  private async ensureVenueExists(
    tenantId: string,
    eventId: string,
    venueId: string,
  ): Promise<void> {
    const venue = await this.venueService.findByTenantEventAndId(
      tenantId,
      eventId,
      venueId,
    );

    if (!venue) {
      throw new NotFoundException('Venue not found in event.');
    }
  }
}
