import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok, JwtAuthGuard, CurrentUser, JwtPayload } from '@ems/common';
import { PricingService } from './pricing.service';
import { CreatePromoCodeDto, ValidatePromoCodeDto } from './dto/pricing.dto';

@ApiTags('promo-codes')
@Controller('promo-codes')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(private readonly svc: PricingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a promo code for an event' })
  async create(@CurrentUser() u: JwtPayload, @Body() dto: CreatePromoCodeDto) {
    return ok(await this.svc.createPromoCode(u.tenantId, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List promo codes for an event' })
  async list(@CurrentUser() u: JwtPayload, @Query('eventId') eventId: string) {
    return ok(await this.svc.listCodes(u.tenantId, eventId));
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a promo code (does not consume it)' })
  async validate(@CurrentUser() u: JwtPayload, @Body() dto: ValidatePromoCodeDto) {
    const promo = await this.svc.validateCode(dto.code, dto.eventId, u.tenantId);
    return ok({ valid: !!promo, promo });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a promo code' })
  async deactivate(@Param('id') id: string, @CurrentUser() u: JwtPayload) {
    return ok(await this.svc.deactivateCode(id, u.tenantId));
  }
}
