import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, paginated, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { NotificationService } from './notification.service';
import { CreateCampaignDto, CreateTemplateDto, SendNotificationDto } from './dto/notification.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly svc: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification to a user' })
  async send(@CurrentUser() u: JwtPayload, @Body() dto: SendNotificationDto) {
    return ok(await this.svc.send(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List notifications for a user' })
  async list(
    @CurrentUser() u: JwtPayload,
    @Query('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const r = await this.svc.listNotifications(u.tenantId, userId, cursor, limit ? +limit : 20);
    return paginated(r.data, r.nextCursor);
  }
}

@ApiTags('notification-templates')
@Controller('notification-templates')
@UseGuards(JwtAuthGuard)
export class NotificationTemplateController {
  constructor(private readonly svc: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification template' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateTemplateDto) {
    return ok(await this.svc.createTemplate(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List notification templates' })
  async list(@CurrentUser() u: JwtPayload) {
    return ok(await this.svc.listTemplates(u.tenantId));
  }
}

@ApiTags('campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly svc: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create and optionally schedule a campaign' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateCampaignDto) {
    return ok(await this.svc.scheduleCampaign(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List campaigns (filter by eventId)' })
  async list(@CurrentUser() u: JwtPayload, @Query('eventId') eventId?: string) {
    return ok(await this.svc.listCampaigns(u.tenantId, eventId));
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send a campaign immediately' })
  async send(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.sendCampaign(id, u.tenantId));
  }
}
