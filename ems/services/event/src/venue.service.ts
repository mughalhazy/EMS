import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { VenueEntity } from './entities/venue.entity';

@Injectable()
export class VenueService {
  constructor(
    @InjectRepository(VenueEntity)
    private readonly venueRepository: Repository<VenueEntity>,
  ) {}

  async create(input: DeepPartial<VenueEntity>): Promise<VenueEntity> {
    const venue = this.venueRepository.create(input);
    return this.venueRepository.save(venue);
  }

  async findByTenantAndEvent(tenantId: string, eventId: string): Promise<VenueEntity[]> {
    return this.venueRepository.find({
      where: { tenantId, eventId },
      relations: { rooms: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantEventAndId(
    tenantId: string,
    eventId: string,
    venueId: string,
  ): Promise<VenueEntity | null> {
    return this.venueRepository.findOne({
      where: { id: venueId, tenantId, eventId },
      relations: { rooms: true },
    });
  }

  async update(
    tenantId: string,
    eventId: string,
    venueId: string,
    input: DeepPartial<VenueEntity>,
  ): Promise<VenueEntity | null> {
    const venue = await this.findByTenantEventAndId(tenantId, eventId, venueId);
    if (!venue) {
      return null;
    }

    Object.assign(venue, input);
    return this.venueRepository.save(venue);
  }

  async remove(tenantId: string, eventId: string, venueId: string): Promise<boolean> {
    const result = await this.venueRepository.delete({ id: venueId, tenantId, eventId });
    return (result.affected ?? 0) > 0;
  }
}
