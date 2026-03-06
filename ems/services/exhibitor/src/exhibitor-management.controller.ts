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

import { AssignExhibitorBoothDto } from './dto/assign-exhibitor-booth.dto';
import { CaptureLeadDto } from './dto/capture-lead.dto';
import { CreateBoothDto } from './dto/create-booth.dto';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { CreateSponsorProfileDto } from './dto/create-sponsor-profile.dto';
import { RecordBoothInteractionDto } from './dto/record-booth-interaction.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';
import { UpdateSponsorProfileDto } from './dto/update-sponsor-profile.dto';
import { BoothEntity } from './entities/booth.entity';
import { BoothInteractionEntity } from './entities/booth-interaction.entity';
import { ExhibitorLeadCaptureEntity } from './entities/exhibitor-lead-capture.entity';
import { ExhibitorEntity } from './entities/exhibitor.entity';
import { SponsorProfileEntity } from './entities/sponsor-profile.entity';
import { ExhibitorManagementService } from './exhibitor-management.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId')
export class ExhibitorManagementController {
  constructor(private readonly exhibitorManagementService: ExhibitorManagementService) {}

  @Post('sponsors')
  @HttpCode(HttpStatus.CREATED)
  async createSponsorProfile(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateSponsorProfileDto,
  ): Promise<SponsorProfileEntity> {
    return this.exhibitorManagementService.createSponsorProfile({
      tenantId,
      eventId,
      name: payload.name,
      description: payload.description,
      websiteUrl: payload.websiteUrl,
      logoUrl: payload.logoUrl,
      sponsorshipTier: payload.sponsorshipTier,
      contactInfo: payload.contactInfo,
      isActive: payload.isActive,
    });
  }

  @Get('sponsors')
  async listSponsorProfiles(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<SponsorProfileEntity[]> {
    return this.exhibitorManagementService.listSponsorProfiles(tenantId, eventId);
  }

  @Get('sponsors/roi-report')
  async getSponsorRoiReport(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.exhibitorManagementService.getSponsorRoiReport(tenantId, eventId);
  }

  @Patch('sponsors/:sponsorProfileId')
  async updateSponsorProfile(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sponsorProfileId', ParseUUIDPipe) sponsorProfileId: string,
    @Body() payload: UpdateSponsorProfileDto,
  ): Promise<SponsorProfileEntity> {
    const sponsorProfile = await this.exhibitorManagementService.updateSponsorProfile(
      tenantId,
      eventId,
      sponsorProfileId,
      payload,
    );

    if (!sponsorProfile) {
      throw new NotFoundException('Sponsor profile not found in event.');
    }

    return sponsorProfile;
  }

  @Delete('sponsors/:sponsorProfileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSponsorProfile(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sponsorProfileId', ParseUUIDPipe) sponsorProfileId: string,
  ): Promise<void> {
    const deleted = await this.exhibitorManagementService.deleteSponsorProfile(
      tenantId,
      eventId,
      sponsorProfileId,
    );

    if (!deleted) {
      throw new NotFoundException('Sponsor profile not found in event.');
    }
  }

  @Post('exhibitors')
  @HttpCode(HttpStatus.CREATED)
  async createExhibitor(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateExhibitorDto,
  ): Promise<ExhibitorEntity> {
    return this.exhibitorManagementService.createExhibitor({
      tenantId,
      eventId,
      name: payload.name,
      description: payload.description,
      sponsorshipTier: payload.sponsorshipTier,
      contactInfo: payload.contactInfo,
    });
  }

  @Get('exhibitors')
  async listExhibitors(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<ExhibitorEntity[]> {
    return this.exhibitorManagementService.listExhibitors(tenantId, eventId);
  }

  @Patch('exhibitors/:exhibitorId')
  async updateExhibitor(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('exhibitorId', ParseUUIDPipe) exhibitorId: string,
    @Body() payload: UpdateExhibitorDto,
  ): Promise<ExhibitorEntity> {
    const exhibitor = await this.exhibitorManagementService.updateExhibitor(
      tenantId,
      eventId,
      exhibitorId,
      payload,
    );

    if (!exhibitor) {
      throw new NotFoundException('Exhibitor not found in event.');
    }

    return exhibitor;
  }

  @Post('booths')
  @HttpCode(HttpStatus.CREATED)
  async createBooth(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CreateBoothDto,
  ): Promise<BoothEntity> {
    return this.exhibitorManagementService.createBooth({
      tenantId,
      eventId,
      exhibitorId: payload.exhibitorId,
      venueId: payload.venueId,
      locationCode: payload.locationCode,
      locationLabel: payload.locationLabel,
      capacity: payload.capacity,
    });
  }

  @Get('booths')
  async listBooths(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<BoothEntity[]> {
    return this.exhibitorManagementService.listBooths(tenantId, eventId);
  }

  @Get('exhibitors/:exhibitorId/booths')
  async listBoothsByExhibitor(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('exhibitorId', ParseUUIDPipe) exhibitorId: string,
  ): Promise<BoothEntity[]> {
    return this.exhibitorManagementService.listBoothsByExhibitor(tenantId, eventId, exhibitorId);
  }

  @Patch('booths/:boothId/assign-exhibitor')
  async assignExhibitorToBooth(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('boothId', ParseUUIDPipe) boothId: string,
    @Body() payload: AssignExhibitorBoothDto,
  ): Promise<BoothEntity> {
    return this.exhibitorManagementService.assignExhibitorToBooth({
      tenantId,
      eventId,
      boothId,
      exhibitorId: payload.exhibitorId,
    });
  }

  @Patch('exhibitors/:exhibitorId/booths/:boothId')
  async assignBoothToExhibitor(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('exhibitorId', ParseUUIDPipe) exhibitorId: string,
    @Param('boothId', ParseUUIDPipe) boothId: string,
  ): Promise<BoothEntity> {
    return this.exhibitorManagementService.assignExhibitorToBooth({
      tenantId,
      eventId,
      boothId,
      exhibitorId,
    });
  }

  @Post('exhibitors/:exhibitorId/leads')
  @HttpCode(HttpStatus.CREATED)
  async captureLead(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('exhibitorId', ParseUUIDPipe) exhibitorId: string,
    @Body() payload: CaptureLeadDto,
  ): Promise<ExhibitorLeadCaptureEntity> {
    return this.exhibitorManagementService.captureLead({
      tenantId,
      eventId,
      exhibitorId,
      attendeeId: payload.attendeeId,
      capturedAt: payload.capturedAt ? new Date(payload.capturedAt) : undefined,
    });
  }

  @Post('exhibitors/:exhibitorId/booths/:boothId/interactions')
  @HttpCode(HttpStatus.CREATED)
  async recordBoothInteraction(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('exhibitorId', ParseUUIDPipe) exhibitorId: string,
    @Param('boothId', ParseUUIDPipe) boothId: string,
    @Body() payload: RecordBoothInteractionDto,
  ): Promise<BoothInteractionEntity> {
    return this.exhibitorManagementService.recordBoothInteraction({
      tenantId,
      eventId,
      exhibitorId,
      boothId,
      attendeeId: payload.attendeeId,
      interactionType: payload.interactionType,
      metadata: payload.metadata,
      interactedAt: payload.interactedAt ? new Date(payload.interactedAt) : undefined,
    });
  }
}
