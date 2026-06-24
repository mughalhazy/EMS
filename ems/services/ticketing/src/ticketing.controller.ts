import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, paginated, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { TicketingService } from './ticketing.service';
import { CreateTicketProductDto, RedeemTicketDto } from './dto/ticketing.dto';

@ApiTags('ticket-products')
@Controller('ticket-products')
@UseGuards(JwtAuthGuard)
export class TicketProductController {
  constructor(private readonly svc: TicketingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a ticket product for an event' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreateTicketProductDto) {
    return ok(await this.svc.createTicketProduct(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List ticket products for an event' })
  async list(@CurrentUser() u: JwtPayload, @Query('eventId') eventId: string) {
    return ok(await this.svc.listTicketProducts(u.tenantId, eventId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket product' })
  async findOne(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.findTicketProduct(id, u.tenantId));
  }
}

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketController {
  constructor(private readonly svc: TicketingService) {}

  @Get()
  @ApiOperation({ summary: 'List tickets (filter by userId or eventId)' })
  async list(
    @CurrentUser() u: JwtPayload,
    @Query('userId') userId?: string,
    @Query('eventId') eventId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const r = await this.svc.listTickets(
      u.tenantId,
      { userId, eventId },
      cursor,
      limit ? +limit : 20,
    );
    return paginated(r.data, r.nextCursor);
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redeem a ticket by QR code' })
  async redeem(@CurrentUser() u: JwtPayload, @Body() dto: RedeemTicketDto) {
    return ok(await this.svc.redeemTicket(dto.qrCode, u.tenantId));
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void a ticket' })
  async void(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.voidTicket(id, u.tenantId));
  }
}
