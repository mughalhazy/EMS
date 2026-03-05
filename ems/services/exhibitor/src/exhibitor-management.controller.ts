import {
  Body,
  Controller,
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
import { CreateBoothDto } from './dto/create-booth.dto';
import { CreateExhibitorDto } from './dto/create-exhibitor.dto';
import { UpdateExhibitorDto } from './dto/update-exhibitor.dto';
import { BoothEntity } from './entities/booth.entity';
import { ExhibitorEntity } from './entities/exhibitor.entity';
import { ExhibitorManagementService } from './exhibitor-management.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId')
export class ExhibitorManagementController {
  constructor(private readonly exhibitorManagementService: ExhibitorManagementService) {}

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
}
