import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { AuditDomain, AuditLogEntity } from './entities/audit-log.entity';

export interface TrackAuditChangeInput {
  tenantId: string;
  actorUserId?: string | null;
  targetUserId?: string | null;
  action: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async trackAuthChange(input: TrackAuditChangeInput): Promise<AuditLogEntity> {
    return this.createAuditLog(AuditDomain.AUTH, input);
  }

  async trackRoleChange(input: TrackAuditChangeInput): Promise<AuditLogEntity> {
    return this.createAuditLog(AuditDomain.ROLE, input);
  }

  async trackTenantChange(input: TrackAuditChangeInput): Promise<AuditLogEntity> {
    return this.createAuditLog(AuditDomain.TENANT, input);
  }

  async trackEventChange(input: TrackAuditChangeInput): Promise<AuditLogEntity> {
    return this.createAuditLog(AuditDomain.EVENT, input);
  }

  async trackCommerceChange(input: TrackAuditChangeInput): Promise<AuditLogEntity> {
    return this.createAuditLog(AuditDomain.COMMERCE, input);
  }

  async trackRegistrationChange(input: TrackAuditChangeInput): Promise<AuditLogEntity> {
    return this.createAuditLog(AuditDomain.REGISTRATION, input);
  }

  async trackOnsiteChange(input: TrackAuditChangeInput): Promise<AuditLogEntity> {
    return this.createAuditLog(AuditDomain.ONSITE, input);
  }

  async listByTenant(tenantId: string, domain?: AuditDomain): Promise<AuditLogEntity[]> {
    const where: FindOptionsWhere<AuditLogEntity> = domain
      ? { tenantId, domain }
      : { tenantId };

    return this.auditLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  private async createAuditLog(
    domain: AuditDomain,
    input: TrackAuditChangeInput,
  ): Promise<AuditLogEntity> {
    const payload: DeepPartial<AuditLogEntity> = {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId ?? null,
      targetUserId: input.targetUserId ?? null,
      domain,
      action: input.action,
      before: input.before ?? null,
      after: input.after ?? null,
      metadata: input.metadata ?? null,
    };

    const event = this.auditLogRepository.create(payload);
    return this.auditLogRepository.save(event);
  }
}
