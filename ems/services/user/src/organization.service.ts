import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationEntity } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {}

  async create(tenantId: string, payload: CreateOrganizationDto): Promise<OrganizationEntity> {
    const organization = this.organizationRepository.create({
      tenantId,
      name: payload.name,
      slug: payload.slug,
      active: payload.active ?? true,
    });

    return this.organizationRepository.save(organization);
  }

  async listByTenant(tenantId: string): Promise<OrganizationEntity[]> {
    return this.organizationRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getByTenant(tenantId: string, organizationId: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId, tenantId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found in tenant.');
    }

    return organization;
  }
}
