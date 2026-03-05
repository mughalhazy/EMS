import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { EventEntity } from '../../event/src/entities/event.entity';
import { VenueEntity } from '../../event/src/entities/venue.entity';
import { BoothEntity } from './entities/booth.entity';
import { ExhibitorEntity } from './entities/exhibitor.entity';

@Injectable()
export class ExhibitorManagementService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectRepository(VenueEntity)
    private readonly venueRepository: Repository<VenueEntity>,
    @InjectRepository(ExhibitorEntity)
    private readonly exhibitorRepository: Repository<ExhibitorEntity>,
    @InjectRepository(BoothEntity)
    private readonly boothRepository: Repository<BoothEntity>,
    private readonly auditService: AuditService,
  ) {}

  async createExhibitor(input: {
    tenantId: string;
    eventId: string;
    name: string;
    description?: string | null;
    contactInfo?: Record<string, unknown> | null;
    sponsorshipTier?: ExhibitorEntity['sponsorshipTier'];
    actorUserId?: string;
  }): Promise<ExhibitorEntity> {
    await this.ensureEventExists(input.tenantId, input.eventId);

    const existing = await this.exhibitorRepository.findOne({
      where: {
        tenantId: input.tenantId,
        eventId: input.eventId,
        name: input.name,
      },
    });

    if (existing) {
      throw new ConflictException(`Exhibitor '${input.name}' already exists in this event.`);
    }

    const exhibitor = await this.exhibitorRepository.save(
      this.exhibitorRepository.create({
        tenantId: input.tenantId,
        eventId: input.eventId,
        name: input.name,
        description: input.description ?? null,
        sponsorshipTier: input.sponsorshipTier ?? null,
        contactInfo: input.contactInfo ?? null,
      }),
    );

    await this.auditService.trackEventChange({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: 'exhibitor.created',
      after: this.auditExhibitor(exhibitor),
    });

    return exhibitor;
  }

  async listExhibitors(tenantId: string, eventId: string): Promise<ExhibitorEntity[]> {
    return this.exhibitorRepository.find({
      where: { tenantId, eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async findExhibitor(
    tenantId: string,
    eventId: string,
    exhibitorId: string,
  ): Promise<ExhibitorEntity | null> {
    return this.exhibitorRepository.findOne({ where: { id: exhibitorId, tenantId, eventId } });
  }

  async updateExhibitor(
    tenantId: string,
    eventId: string,
    exhibitorId: string,
    input: Partial<ExhibitorEntity>,
    actorUserId?: string,
  ): Promise<ExhibitorEntity | null> {
    const exhibitor = await this.findExhibitor(tenantId, eventId, exhibitorId);
    if (!exhibitor) {
      return null;
    }

    if (input.eventId && input.eventId !== eventId) {
      throw new ConflictException('Exhibitor cannot be moved to a different event.');
    }

    if (input.tenantId && input.tenantId !== tenantId) {
      throw new ConflictException('Exhibitor cannot be moved to a different tenant.');
    }

    const before = this.auditExhibitor(exhibitor);
    Object.assign(exhibitor, input);
    const updated = await this.exhibitorRepository.save(exhibitor);

    await this.auditService.trackEventChange({
      tenantId,
      actorUserId,
      action: 'exhibitor.updated',
      before,
      after: this.auditExhibitor(updated),
    });

    return updated;
  }

  async createBooth(input: {
    tenantId: string;
    eventId: string;
    exhibitorId: string;
    venueId: string;
    locationCode: string;
    locationLabel: string;
    capacity: number;
    actorUserId?: string;
  }): Promise<BoothEntity> {
    await this.ensureExhibitorExists(input.tenantId, input.eventId, input.exhibitorId);
    await this.ensureVenueExists(input.tenantId, input.eventId, input.venueId);

    const booth = await this.boothRepository.save(
      this.boothRepository.create({
        tenantId: input.tenantId,
        eventId: input.eventId,
        exhibitorId: input.exhibitorId,
        venueId: input.venueId,
        locationCode: input.locationCode,
        locationLabel: input.locationLabel,
        capacity: input.capacity,
      }),
    );

    await this.auditService.trackEventChange({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: 'booth.created',
      after: this.auditBooth(booth),
    });

    return this.boothRepository.findOneOrFail({
      where: { id: booth.id, tenantId: input.tenantId, eventId: input.eventId },
      relations: { exhibitor: true, venue: true },
    });
  }

  async listBooths(tenantId: string, eventId: string): Promise<BoothEntity[]> {
    return this.boothRepository.find({
      where: { tenantId, eventId },
      relations: { exhibitor: true, venue: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listBoothsByExhibitor(
    tenantId: string,
    eventId: string,
    exhibitorId: string,
  ): Promise<BoothEntity[]> {
    return this.boothRepository.find({
      where: { tenantId, eventId, exhibitorId },
      relations: { exhibitor: true, venue: true },
      order: { createdAt: 'DESC' },
    });
  }

  async assignExhibitorToBooth(input: {
    tenantId: string;
    eventId: string;
    boothId: string;
    exhibitorId: string;
    actorUserId?: string;
  }): Promise<BoothEntity> {
    await this.ensureExhibitorExists(input.tenantId, input.eventId, input.exhibitorId);

    const booth = await this.boothRepository.findOne({
      where: {
        id: input.boothId,
        tenantId: input.tenantId,
        eventId: input.eventId,
      },
      relations: { exhibitor: true, venue: true },
    });

    if (!booth) {
      throw new NotFoundException('Booth not found in event.');
    }

    const before = this.auditBooth(booth);
    booth.exhibitorId = input.exhibitorId;
    const updated = await this.boothRepository.save(booth);

    await this.auditService.trackEventChange({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: 'booth.exhibitor_assigned',
      before,
      after: this.auditBooth(updated),
    });

    return this.boothRepository.findOneOrFail({
      where: { id: updated.id, tenantId: input.tenantId, eventId: input.eventId },
      relations: { exhibitor: true, venue: true },
    });
  }

  private async ensureEventExists(tenantId: string, eventId: string): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { id: eventId, tenantId } });
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }
  }

  private async ensureExhibitorExists(
    tenantId: string,
    eventId: string,
    exhibitorId: string,
  ): Promise<void> {
    const exhibitor = await this.findExhibitor(tenantId, eventId, exhibitorId);
    if (!exhibitor) {
      throw new NotFoundException('Exhibitor not found in event.');
    }
  }

  private async ensureVenueExists(
    tenantId: string,
    eventId: string,
    venueId: string,
  ): Promise<void> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId, tenantId, eventId } });
    if (!venue) {
      throw new NotFoundException('Venue not found in event.');
    }
  }

  private auditExhibitor(exhibitor: ExhibitorEntity): Record<string, unknown> {
    return {
      id: exhibitor.id,
      eventId: exhibitor.eventId,
      name: exhibitor.name,
      description: exhibitor.description,
      sponsorshipTier: exhibitor.sponsorshipTier,
      contactInfo: exhibitor.contactInfo,
    };
  }

  private auditBooth(booth: BoothEntity): Record<string, unknown> {
    return {
      id: booth.id,
      eventId: booth.eventId,
      exhibitorId: booth.exhibitorId,
      venueId: booth.venueId,
      locationCode: booth.locationCode,
      locationLabel: booth.locationLabel,
      capacity: booth.capacity,
    };
  }
}
