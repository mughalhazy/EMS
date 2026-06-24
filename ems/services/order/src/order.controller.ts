import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, paginated, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly svc: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order (reserves inventory)' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateOrderDto) {
    return ok(await this.svc.createOrder(u.tenantId, u.sub, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List orders for tenant (filter by userId)' })
  async list(
    @CurrentUser() u: JwtPayload,
    @Query('userId') userId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const r = await this.svc.listOrders(u.tenantId, userId, cursor, limit ? +limit : 20);
    return paginated(r.data, r.nextCursor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order with items' })
  async findOne(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.findOrder(id, u.tenantId));
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (releases inventory)' })
  async cancel(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.cancelOrder(id, u.tenantId));
  }
}
