import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { PaymentService } from './payment.service';
import { CompletePaymentDto, CreatePaymentDto, RefundDto } from './dto/payment.dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly svc: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a pending payment for an order' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreatePaymentDto) {
    return ok(await this.svc.createPayment(u.tenantId, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.findPayment(id, u.tenantId));
  }

  @Get()
  @ApiOperation({ summary: 'List payments for an order' })
  async listByOrder(@Query('orderId') orderId: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.listByOrder(orderId, u.tenantId));
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark a payment completed (simulates provider callback)' })
  async complete(
    @Param('id') id: string,
    @CurrentUser() u: JwtPayload,
    @Body() dto: CompletePaymentDto,
  ) {
    return ok(await this.svc.completePayment(id, u.tenantId, dto));
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Mark a payment failed' })
  async fail(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.failPayment(id, u.tenantId));
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a completed payment' })
  async refund(@Param('id') id: string, @CurrentUser() u: JwtPayload, @Body() dto: RefundDto) {
    return ok(await this.svc.refund(id, u.tenantId, dto));
  }
}
