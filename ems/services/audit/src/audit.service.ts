import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import {
  AuditCategory,
  AuditDomain,
  AuditLogEntity,
  AuditSeverity,
} from './entities/audit-log.entity';

export interface TrackAuditChangeInput {
  tenantId: string;
  actorUserId?: string | null;
  targetUserId?: string | null;
  action: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
  entityType?: string | null;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}



export interface ListAuditLogsInput {
  tenantId: string;
  domain?: AuditDomain;
  category?: AuditCategory;
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

  async listByTenant(input: ListAuditLogsInput): Promise<AuditLogEntity[]> {
    const where: FindOptionsWhere<AuditLogEntity> = {
      tenantId: input.tenantId,
      ...(input.domain ? { domain: input.domain } : {}),
      ...(input.category ? { category: input.category } : {}),
    };

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
      category: input.category ?? AuditCategory.USER_ACTION,
      severity: input.severity ?? AuditSeverity.INFO,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      metadata: input.metadata ?? null,
    };

    const event = this.auditLogRepository.create(payload);
    return this.auditLogRepository.save(event);
  }
}
