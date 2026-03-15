import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import { TenantEntity } from './entities/tenant.entity';
import { TenantSettingsEntity } from './entities/tenant-settings.entity';
import { TenantService } from './tenant.service';

@Controller('api/v1/tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Body() payload: CreateTenantDto): Promise<TenantEntity> {
    return this.tenantService.createTenant(payload);
  }

  @Get()
  async listTenants(): Promise<TenantEntity[]> {
    return this.tenantService.listTenants();
  }

  @Get(':tenantId/settings')
  async getTenantSettings(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ): Promise<TenantSettingsEntity> {
    return this.tenantService.getTenantSettings(tenantId);
  }

  @Patch(':tenantId/settings')
  async updateTenantSettings(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() payload: UpdateTenantSettingsDto,
  ): Promise<TenantSettingsEntity> {
    return this.tenantService.updateTenantSettings(tenantId, payload);
  }
}
