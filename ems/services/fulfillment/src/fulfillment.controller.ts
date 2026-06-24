import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { FulfillmentService } from './fulfillment.service';

@ApiTags('fulfillments')
@Controller('fulfillments')
@UseGuards(JwtAuthGuard)
export class FulfillmentController {
  constructor(private readonly svc: FulfillmentService) {}

  @Get('by-order/:orderId')
  @ApiOperation({ summary: 'Get fulfillment record for an order' })
  async getByOrder(@Param('orderId') orderId: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.getFulfillment(orderId, u.tenantId));
  }
}
