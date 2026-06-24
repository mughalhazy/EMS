import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, paginated, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { ExhibitorService } from './exhibitor.service';
import {
  CreateExhibitorDto,
  CreateBoothDto,
  CreateSponsorPackageDto,
  CreateSponsorDto,
  CaptureLeadDto,
} from './dto/create-exhibitor.dto';

@ApiTags('exhibitors')
@Controller('exhibitors')
@UseGuards(JwtAuthGuard)
export class ExhibitorController {
  constructor(private readonly svc: ExhibitorService) {}

  @Post()
  @ApiOperation({ summary: 'Register an exhibitor for an event' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateExhibitorDto) {
    return ok(await this.svc.createExhibitor(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List exhibitors' })
  async list(
    @CurrentUser() u: JwtPayload,
    @Query('eventId') eventId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const r = await this.svc.listExhibitors(u.tenantId, eventId, cursor, limit ? +limit : 20);
    return paginated(r.data, r.nextCursor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exhibitor by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.findExhibitor(id, u.tenantId));
  }

  @Post(':id/booths')
  @ApiOperation({ summary: 'Add a booth for an exhibitor' })
  async createBooth(
    @Param('id') id: string,
    @CurrentUser() u: JwtPayload,
    @Body() dto: CreateBoothDto,
  ) {
    return ok(await this.svc.createBooth(id, u.tenantId, dto));
  }

  @Get(':id/booths')
  @ApiOperation({ summary: 'List booths for an exhibitor' })
  async listBooths(@Param('id') id: string) {
    return ok(await this.svc.listBooths(id));
  }

  @Get(':id/leads')
  @ApiOperation({ summary: 'List leads captured by an exhibitor' })
  async listLeads(
    @Param('id') id: string,
    @CurrentUser() u: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const r = await this.svc.listLeads(id, u.tenantId, cursor, limit ? +limit : 20);
    return paginated(r.data, r.nextCursor);
  }
}

@ApiTags('leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadController {
  constructor(private readonly svc: ExhibitorService) {}

  @Post()
  @ApiOperation({ summary: 'Capture a lead (attendee scanned at booth)' })
  async capture(@CurrentUser() u: JwtPayload, @Body() dto: CaptureLeadDto) {
    return ok(await this.svc.captureLead(u.tenantId, dto));
  }
}

@ApiTags('sponsor-packages')
@Controller('sponsor-packages')
@UseGuards(JwtAuthGuard)
export class SponsorPackageController {
  constructor(private readonly svc: ExhibitorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sponsor package for an event' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateSponsorPackageDto) {
    return ok(await this.svc.createSponsorPackage(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List sponsor packages for an event' })
  async list(@Query('eventId') eventId: string) {
    return ok(await this.svc.listSponsorPackages(eventId));
  }
}

@ApiTags('sponsors')
@Controller('sponsors')
@UseGuards(JwtAuthGuard)
export class SponsorController {
  constructor(private readonly svc: ExhibitorService) {}

  @Post()
  @ApiOperation({ summary: 'Create a sponsor (link exhibitor to a package)' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateSponsorDto) {
    return ok(await this.svc.createSponsor(u.tenantId, dto));
  }
}
