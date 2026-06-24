import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService } from '@ems/event-bus';
import { Exhibitor } from './entities/exhibitor.entity';
import { Booth } from './entities/booth.entity';
import { SponsorPackage } from './entities/sponsor-package.entity';
import { Sponsor } from './entities/sponsor.entity';
import { Lead } from './entities/lead.entity';
import {
  CreateExhibitorDto,
  CreateBoothDto,
  CreateSponsorPackageDto,
  CreateSponsorDto,
  CaptureLeadDto,
} from './dto/create-exhibitor.dto';

@Injectable()
export class ExhibitorService implements OnModuleInit {
  constructor(
    @InjectRepository(Exhibitor) private readonly exhibitors: Repository<Exhibitor>,
    @InjectRepository(Booth) private readonly booths: Repository<Booth>,
    @InjectRepository(SponsorPackage) private readonly packages: Repository<SponsorPackage>,
    @InjectRepository(Sponsor) private readonly sponsors: Repository<Sponsor>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      'exhibitor-service',
      ['event.created', 'attendee.created'],
      async (_event) => {
        // hook for future validation flows
      },
    );
  }

  async createExhibitor(tenantId: string, dto: CreateExhibitorDto) {
    const exhibitor = this.exhibitors.create({ tenantId, ...dto });
    await this.exhibitors.save(exhibitor);
    await this.eventBus.publish('exhibitor.created', {
      eventType: 'exhibitor.created',
      tenantId,
      payload: { exhibitorId: exhibitor.id, eventId: exhibitor.eventId },
    });
    return exhibitor;
  }

  async listExhibitors(tenantId: string, eventId?: string, cursor?: string, limit = 20) {
    const qb = this.exhibitors
      .createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId })
      .orderBy('e.createdAt', 'DESC')
      .take(limit + 1);
    if (eventId) qb.andWhere('e.eventId = :eventId', { eventId });
    if (cursor) qb.andWhere('e.id < :cursor', { cursor });
    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
  }

  async findExhibitor(id: string, tenantId: string) {
    const ex = await this.exhibitors.findOne({ where: { id, tenantId } });
    if (!ex) throw new NotFoundException('Exhibitor not found');
    return ex;
  }

  async createBooth(exhibitorId: string, tenantId: string, dto: CreateBoothDto) {
    await this.findExhibitor(exhibitorId, tenantId);
    const booth = this.booths.create({ exhibitorId, ...dto });
    return this.booths.save(booth);
  }

  async listBooths(exhibitorId: string) {
    return this.booths.find({ where: { exhibitorId } });
  }

  async createSponsorPackage(tenantId: string, dto: CreateSponsorPackageDto) {
    const pkg = this.packages.create(dto);
    return this.packages.save(pkg);
  }

  async listSponsorPackages(eventId: string) {
    return this.packages.find({ where: { eventId } });
  }

  async createSponsor(tenantId: string, dto: CreateSponsorDto) {
    const sponsor = this.sponsors.create(dto);
    await this.sponsors.save(sponsor);
    await this.eventBus.publish('sponsor.created', {
      eventType: 'sponsor.created',
      tenantId,
      payload: {
        sponsorId: sponsor.id,
        eventId: sponsor.eventId,
        sponsorPackageId: sponsor.sponsorPackageId,
      },
    });
    return sponsor;
  }

  async captureLead(tenantId: string, dto: CaptureLeadDto) {
    const lead = this.leads.create(dto);
    await this.leads.save(lead);
    await this.eventBus.publish('lead.captured', {
      eventType: 'lead.captured',
      tenantId,
      payload: { leadId: lead.id, exhibitorId: lead.exhibitorId, attendeeId: lead.attendeeId },
    });
    return lead;
  }

  async listLeads(exhibitorId: string, tenantId: string, cursor?: string, limit = 20) {
    await this.findExhibitor(exhibitorId, tenantId);
    const qb = this.leads
      .createQueryBuilder('l')
      .where('l.exhibitorId = :exhibitorId', { exhibitorId })
      .orderBy('l.capturedAt', 'DESC')
      .take(limit + 1);
    if (cursor) qb.andWhere('l.id < :cursor', { cursor });
    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
  }
}
