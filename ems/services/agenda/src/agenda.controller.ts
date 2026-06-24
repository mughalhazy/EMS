import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { AgendaService } from './agenda.service';
import { CreateTrackDto, UpdateTrackDto } from './dto/create-track.dto';
import { CreateSessionDto, UpdateSessionDto } from './dto/create-session.dto';

@ApiTags('tracks')
@Controller('tracks')
@UseGuards(JwtAuthGuard)
export class TrackController {
  constructor(private readonly svc: AgendaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a track' })
  async create(@Body() dto: CreateTrackDto) {
    return ok(await this.svc.createTrack(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List tracks for an event' })
  async list(@Query('eventId') eventId: string) {
    return ok(await this.svc.listTracks(eventId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get track by ID' })
  async findOne(@Param('id') id: string) {
    return ok(await this.svc.findTrack(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update track' })
  async update(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return ok(await this.svc.updateTrack(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete track' })
  async remove(@Param('id') id: string) {
    await this.svc.deleteTrack(id);
    return ok({ deleted: true });
  }
}

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly svc: AgendaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a session (with room conflict check)' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateSessionDto) {
    return ok(await this.svc.createSession(dto, u.tenantId));
  }

  @Get()
  @ApiOperation({ summary: 'List sessions by event or track' })
  async list(@Query('eventId') eventId: string, @Query('trackId') trackId?: string) {
    return ok(await this.svc.listSessions(eventId, trackId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session by ID' })
  async findOne(@Param('id') id: string) {
    return ok(await this.svc.findSession(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update session' })
  async update(
    @Param('id') id: string,
    @CurrentUser() u: JwtPayload,
    @Body() dto: UpdateSessionDto,
  ) {
    return ok(await this.svc.updateSession(id, dto, u.tenantId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel session' })
  async remove(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    await this.svc.deleteSession(id, u.tenantId);
    return ok({ cancelled: true });
  }
}
