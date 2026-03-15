import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantSettingsDto } from './dto/update-tenant-settings.dto';
import { TenantEntity } from './entities/tenant.entity';
import { TenantSettingsEntity } from './entities/tenant-settings.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
    @InjectRepository(TenantSettingsEntity)
    private readonly tenantSettingsRepository: Repository<TenantSettingsEntity>,
  ) {}

  async createTenant(payload: CreateTenantDto): Promise<TenantEntity> {
    const tenant = this.tenantRepository.create({
      name: payload.name,
      slug: payload.slug,
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    const tenantSettings = this.tenantSettingsRepository.create({
      tenantId: savedTenant.id,
      timezone: payload.timezone ?? 'UTC',
      locale: payload.locale ?? 'en-US',
      config: payload.config ?? {},
    });

    await this.tenantSettingsRepository.save(tenantSettings);

    return this.getTenant(savedTenant.id);
  }

  async listTenants(): Promise<TenantEntity[]> {
    return this.tenantRepository.find({
      relations: { settings: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getTenant(tenantId: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
      relations: { settings: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return tenant;
  }

  async getTenantSettings(tenantId: string): Promise<TenantSettingsEntity> {
    const settings = await this.tenantSettingsRepository.findOne({
      where: { tenantId },
    });

    if (!settings) {
      throw new NotFoundException('Tenant settings not found.');
    }

    return settings;
  }

  async updateTenantSettings(
    tenantId: string,
    payload: UpdateTenantSettingsDto,
  ): Promise<TenantSettingsEntity> {
    const existing = await this.getTenantSettings(tenantId);

    const mergedConfig = payload.config
      ? { ...(existing.config ?? {}), ...payload.config }
      : existing.config;

    Object.assign(existing, {
      timezone: payload.timezone ?? existing.timezone,
      locale: payload.locale ?? existing.locale,
      config: mergedConfig,
    });

    return this.tenantSettingsRepository.save(existing);
  }
}
