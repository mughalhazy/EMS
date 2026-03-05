import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { RoomEntity } from './entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
  ) {}

  async create(input: DeepPartial<RoomEntity>): Promise<RoomEntity> {
    const room = this.roomRepository.create(input);
    return this.roomRepository.save(room);
  }

  async findByTenantEventAndVenue(
    tenantId: string,
    eventId: string,
    venueId: string,
  ): Promise<RoomEntity[]> {
    return this.roomRepository.find({
      where: { tenantId, eventId, venueId },
      relations: { venue: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantEventVenueAndId(
    tenantId: string,
    eventId: string,
    venueId: string,
    roomId: string,
  ): Promise<RoomEntity | null> {
    return this.roomRepository.findOne({
      where: { id: roomId, tenantId, eventId, venueId },
      relations: { venue: true },
    });
  }

  async update(
    tenantId: string,
    eventId: string,
    venueId: string,
    roomId: string,
    input: DeepPartial<RoomEntity>,
  ): Promise<RoomEntity | null> {
    const room = await this.findByTenantEventVenueAndId(
      tenantId,
      eventId,
      venueId,
      roomId,
    );
    if (!room) {
      return null;
    }

    Object.assign(room, input);
    return this.roomRepository.save(room);
  }

  async remove(
    tenantId: string,
    eventId: string,
    venueId: string,
    roomId: string,
  ): Promise<boolean> {
    const result = await this.roomRepository.delete({
      id: roomId,
      tenantId,
      eventId,
      venueId,
    });
    return (result.affected ?? 0) > 0;
  }
}
