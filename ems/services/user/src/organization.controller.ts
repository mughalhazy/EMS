import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationEntity } from './entities/organization.entity';
import { OrganizationService } from './organization.service';
import { TenantContext } from './tenant-context';

@Controller('api/v1/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @Body() payload: CreateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required for organization creation');
    }

    return this.organizationService.create(tenantId, payload);
  }

  @Get()
  async listOrganizations(): Promise<OrganizationEntity[]> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required for organization list');
    }

    return this.organizationService.listByTenant(tenantId);
  }

  @Get(':organizationId')
  async getOrganization(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ): Promise<OrganizationEntity> {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('Tenant context is required for organization retrieval');
    }

    return this.organizationService.getByTenant(tenantId, organizationId);
  }
}
