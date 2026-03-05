import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Tenant } from './tenant.entity';

export interface CreateTenantInput {
  name: string;
  slug: string;
  isActive?: boolean;
}

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(input: CreateTenantInput): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      name: input.name,
      slug: input.slug,
      isActive: input.isActive ?? true,
    });

    return this.tenantRepository.save(tenant);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { slug } });
  }

  async list(): Promise<Tenant[]> {
    return this.tenantRepository.find({ order: { createdAt: 'DESC' } });
  }
}
