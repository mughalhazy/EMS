import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Get(':ticketProductId')
  @ApiOperation({ summary: 'Get inventory level for a ticket product' })
  async get(@Param('ticketProductId') ticketProductId: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.getItem(ticketProductId, u.tenantId));
  }
}
