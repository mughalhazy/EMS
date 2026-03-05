import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './tenant.entity';
import { TenantService } from './tenant.service';

@Controller('api/v1/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Body() payload: CreateTenantDto): Promise<Tenant> {
    const existingTenant = await this.tenantService.findBySlug(payload.slug);
    if (existingTenant) {
      throw new ConflictException(`Tenant slug '${payload.slug}' is already in use.`);
    }

    return this.tenantService.create(payload);
  }

  @Get()
  async listTenants(): Promise<Tenant[]> {
    return this.tenantService.list();
  }
}
