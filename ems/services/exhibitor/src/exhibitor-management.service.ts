import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditService } from '../../audit/src/audit.service';
import { AttendeeEntity } from '../../attendee/src/entities/attendee.entity';
import { EventEntity } from '../../event/src/entities/event.entity';
import { VenueEntity } from '../../event/src/entities/venue.entity';
import { BoothEntity } from './entities/booth.entity';
import { ExhibitorLeadCaptureEntity } from './entities/exhibitor-lead-capture.entity';
import { ExhibitorEntity } from './entities/exhibitor.entity';
import { SponsorProfileEntity } from './entities/sponsor-profile.entity';
import { ExhibitorEventsPublisher } from './exhibitor-events.publisher';

@Injectable()
export class ExhibitorManagementService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    @InjectRepository(VenueEntity)
    private readonly venueRepository: Repository<VenueEntity>,
    @InjectRepository(ExhibitorEntity)
    private readonly exhibitorRepository: Repository<ExhibitorEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepository: Repository<AttendeeEntity>,
    @InjectRepository(ExhibitorLeadCaptureEntity)
    private readonly exhibitorLeadCaptureRepository: Repository<ExhibitorLeadCaptureEntity>,
    @InjectRepository(BoothEntity)
    private readonly boothRepository: Repository<BoothEntity>,
    @InjectRepository(SponsorProfileEntity)
    private readonly sponsorProfileRepository: Repository<SponsorProfileEntity>,
    private readonly auditService: AuditService,
    private readonly exhibitorEventsPublisher: ExhibitorEventsPublisher,
  ) {}

  async createExhibitor(input: {
    tenantId: string;
    eventId: string;
    name: string;
    description?: string | null;
    sponsorshipTier?: ExhibitorEntity['sponsorshipTier'];
    contactInfo?: Record<string, unknown> | null;
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

    await this.exhibitorEventsPublisher.publishExhibitorCreated(exhibitor);

    return exhibitor;
  }

  async createSponsorProfile(input: {
    tenantId: string;
    eventId: string;
    name: string;
    description?: string | null;
    websiteUrl?: string | null;
    logoUrl?: string | null;
    sponsorshipTier?: SponsorProfileEntity['sponsorshipTier'];
    contactInfo?: Record<string, unknown> | null;
    isActive?: boolean;
    actorUserId?: string;
  }): Promise<SponsorProfileEntity> {
    await this.ensureEventExists(input.tenantId, input.eventId);

    const existing = await this.sponsorProfileRepository.findOne({
      where: {
        tenantId: input.tenantId,
        eventId: input.eventId,
        name: input.name,
      },
    });

    if (existing) {
      throw new ConflictException(`Sponsor profile '${input.name}' already exists in this event.`);
    }

    const sponsorProfile = await this.sponsorProfileRepository.save(
      this.sponsorProfileRepository.create({
        tenantId: input.tenantId,
        eventId: input.eventId,
        name: input.name,
        description: input.description ?? null,
        websiteUrl: input.websiteUrl ?? null,
        logoUrl: input.logoUrl ?? null,
        sponsorshipTier: input.sponsorshipTier ?? null,
        contactInfo: input.contactInfo ?? null,
        isActive: input.isActive ?? true,
      }),
    );

    await this.auditService.trackEventChange({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: 'sponsor_profile.created',
      after: this.auditSponsorProfile(sponsorProfile),
    });

    return sponsorProfile;
  }

  async listSponsorProfiles(tenantId: string, eventId: string): Promise<SponsorProfileEntity[]> {
    return this.sponsorProfileRepository.find({
      where: { tenantId, eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async findSponsorProfile(
    tenantId: string,
    eventId: string,
    sponsorProfileId: string,
  ): Promise<SponsorProfileEntity | null> {
    return this.sponsorProfileRepository.findOne({
      where: { id: sponsorProfileId, tenantId, eventId },
    });
  }

  async updateSponsorProfile(
    tenantId: string,
    eventId: string,
    sponsorProfileId: string,
    input: Partial<SponsorProfileEntity>,
    actorUserId?: string,
  ): Promise<SponsorProfileEntity | null> {
    const sponsorProfile = await this.findSponsorProfile(tenantId, eventId, sponsorProfileId);
    if (!sponsorProfile) {
      return null;
    }

    if (input.eventId && input.eventId !== eventId) {
      throw new ConflictException('Sponsor profile cannot be moved to a different event.');
    }

    if (input.tenantId && input.tenantId !== tenantId) {
      throw new ConflictException('Sponsor profile cannot be moved to a different tenant.');
    }

    const before = this.auditSponsorProfile(sponsorProfile);
    Object.assign(sponsorProfile, input);
    const updated = await this.sponsorProfileRepository.save(sponsorProfile);

    await this.auditService.trackEventChange({
      tenantId,
      actorUserId,
      action: 'sponsor_profile.updated',
      before,
      after: this.auditSponsorProfile(updated),
    });

    return updated;
  }

  async deleteSponsorProfile(
    tenantId: string,
    eventId: string,
    sponsorProfileId: string,
    actorUserId?: string,
  ): Promise<boolean> {
    const sponsorProfile = await this.findSponsorProfile(tenantId, eventId, sponsorProfileId);

    if (!sponsorProfile) {
      return false;
    }

    await this.sponsorProfileRepository.delete({ id: sponsorProfileId, tenantId, eventId });

    await this.auditService.trackEventChange({
      tenantId,
      actorUserId,
      action: 'sponsor_profile.deleted',
      before: this.auditSponsorProfile(sponsorProfile),
    });

    return true;
  }

  async captureLead(input: {
    tenantId: string;
    eventId: string;
    exhibitorId: string;
    attendeeId: string;
    capturedAt?: Date;
    actorUserId?: string;
  }): Promise<ExhibitorLeadCaptureEntity> {
    await this.ensureExhibitorExists(input.tenantId, input.eventId, input.exhibitorId);
    await this.ensureAttendeeExists(input.tenantId, input.eventId, input.attendeeId);

    const leadCapture = await this.exhibitorLeadCaptureRepository.save(
      this.exhibitorLeadCaptureRepository.create({
        exhibitorId: input.exhibitorId,
        attendeeId: input.attendeeId,
        capturedAt: input.capturedAt ?? new Date(),
      }),
    );

    await this.auditService.trackEventChange({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: 'lead.captured',
      after: {
        exhibitorId: leadCapture.exhibitorId,
        attendeeId: leadCapture.attendeeId,
        capturedAt: leadCapture.capturedAt,
      },
    });

    await this.exhibitorEventsPublisher.publishLeadCaptured(leadCapture, {
      tenantId: input.tenantId,
      eventId: input.eventId,
    });

    return leadCapture;
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

    const after = this.auditExhibitor(updated);

    await this.auditService.trackEventChange({
      tenantId,
      actorUserId,
      action: 'exhibitor.updated',
      before,
      after,
    });

    if (before.sponsorshipTier !== after.sponsorshipTier) {
      await this.auditService.trackEventChange({
        tenantId,
        actorUserId,
        action: 'sponsor.updated',
        before: { id: before.id, eventId: before.eventId, sponsorshipTier: before.sponsorshipTier },
        after: { id: after.id, eventId: after.eventId, sponsorshipTier: after.sponsorshipTier },
      });
    }

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

  private async ensureAttendeeExists(
    tenantId: string,
    eventId: string,
    attendeeId: string,
  ): Promise<void> {
    const attendee = await this.attendeeRepository.findOne({ where: { id: attendeeId, tenantId, eventId } });
    if (!attendee) {
      throw new NotFoundException('Attendee not found in event.');
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


  private auditSponsorProfile(sponsorProfile: SponsorProfileEntity): Record<string, unknown> {
    return {
      id: sponsorProfile.id,
      eventId: sponsorProfile.eventId,
      name: sponsorProfile.name,
      description: sponsorProfile.description,
      websiteUrl: sponsorProfile.websiteUrl,
      logoUrl: sponsorProfile.logoUrl,
      sponsorshipTier: sponsorProfile.sponsorshipTier,
      contactInfo: sponsorProfile.contactInfo,
      isActive: sponsorProfile.isActive,
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
