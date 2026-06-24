import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { IntegrationService } from './integration.service';
import { CreateWebhookSubscriptionDto } from './dto/integration.dto';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  constructor(private readonly svc: IntegrationService) {}

  @Post()
  @ApiOperation({ summary: 'Register a webhook subscription' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateWebhookSubscriptionDto) {
    return ok(await this.svc.createSubscription(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List webhook subscriptions for the tenant' })
  async list(@CurrentUser() u: JwtPayload) {
    return ok(await this.svc.listSubscriptions(u.tenantId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook subscription' })
  async remove(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    await this.svc.deleteSubscription(id, u.tenantId);
    return ok(null);
  }
}
