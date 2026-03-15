import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CheckInAttendeeDto } from './dto/check-in-attendee.dto';
import { RegisterScanningDeviceDto } from './dto/register-scanning-device.dto';
import { ScanSessionCheckInDto } from './dto/scan-session-check-in.dto';
import { UpdateScanningDeviceStatusDto } from './dto/update-scanning-device-status.dto';
import { PrintBadgeDto } from './dto/print-badge.dto';
import { ValidateBadgeDto } from './dto/validate-badge.dto';
import {
  BadgePrintResult,
  BadgeValidationResult,
  CheckInResult,
  DeviceMonitorResult,
  OnsiteService,
  ScanningDeviceResult,
  SessionScanResult,
} from './onsite.service';

@Controller('api/v1/tenants/:tenantId/events/:eventId/check-ins')
export class OnsiteController {
  constructor(private readonly onsiteService: OnsiteService) {}

  @Post('devices')
  @HttpCode(HttpStatus.CREATED)
  async registerScanningDevice(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: RegisterScanningDeviceDto,
  ): Promise<ScanningDeviceResult> {
    return this.onsiteService.registerScanningDevice(
      tenantId,
      eventId,
      payload.deviceId,
      payload.status,
    );
  }

  @Patch('devices/:deviceId/status')
  async updateScanningDeviceStatus(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('deviceId') deviceId: string,
    @Body() payload: UpdateScanningDeviceStatusDto,
  ): Promise<ScanningDeviceResult> {
    return this.onsiteService.updateScanningDeviceStatus(
      tenantId,
      eventId,
      deviceId,
      payload.status,
    );
  }

  @Get('devices/monitoring')
  async monitorScanningDevices(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
  ): Promise<DeviceMonitorResult[]> {
    return this.onsiteService.monitorScanningDevices(tenantId, eventId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async checkInAttendee(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: CheckInAttendeeDto,
  ): Promise<CheckInResult> {
    return this.onsiteService.checkInAttendee(
      tenantId,
      eventId,
      payload.attendeeId,
      payload.deviceId,
    );
  }

  @Post('sessions/:sessionId/scans')
  @HttpCode(HttpStatus.CREATED)
  async scanSessionCheckIn(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() payload: ScanSessionCheckInDto,
  ): Promise<SessionScanResult> {
    return this.onsiteService.scanSessionCheckIn(
      tenantId,
      eventId,
      sessionId,
      payload.attendeeId,
      payload.deviceId,
      payload.qrTicketCode,
    );
  }


  @Post('badges/validate')
  @HttpCode(HttpStatus.OK)
  async validateBadge(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: ValidateBadgeDto,
  ): Promise<BadgeValidationResult> {
    return this.onsiteService.validateBadge(
      tenantId,
      eventId,
      payload.badgeId,
      payload.attendeeId,
    );
  }

  @Post('badges/print')
  @HttpCode(HttpStatus.CREATED)
  async printBadge(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() payload: PrintBadgeDto,
  ): Promise<BadgePrintResult> {
    return this.onsiteService.printBadge(
      tenantId,
      eventId,
      payload.attendeeId,
      payload.deviceId,
    );
  }
}
