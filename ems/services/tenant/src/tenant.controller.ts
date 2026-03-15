import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { ApiDataResponseDto } from './dto/api-response.dto';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './tenant.entity';
import { TenantService } from './tenant.service';

@Controller('api/v1/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(
    @Body() payload: CreateTenantDto,
    @Req() request: Request,
  ): Promise<ApiDataResponseDto<Tenant>> {
    const existingTenant = await this.tenantService.findBySlug(payload.slug);
    if (existingTenant) {
      throw new ConflictException(`Tenant slug '${payload.slug}' is already in use.`);
    }

    const tenant = await this.tenantService.create(payload);
    return this.successResponse(tenant, request);
  }

  @Get()
  async listTenants(@Req() request: Request): Promise<ApiDataResponseDto<Tenant[]>> {
    const tenants = await this.tenantService.list();
    return this.successResponse(tenants, request);
  }

  private successResponse<T>(data: T, request: Request): ApiDataResponseDto<T> {
    return {
      data,
      meta: {
        requestId: request.headers['x-request-id']?.toString() ?? 'generated-request-id',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
