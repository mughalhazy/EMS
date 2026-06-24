import { Repository, FindManyOptions, FindOneOptions, DeepPartial } from 'typeorm';

/**
 * Base repository that automatically scopes all queries to a tenant.
 * Every entity using this base must have a tenantId column.
 * No cross-service DB access — each service extends this for its own entities only.
 */
export abstract class TenantScopedRepository<T extends { tenantId: string }> {
  constructor(protected readonly repo: Repository<T>) {}

  async findOne(tenantId: string, options: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne({
      ...options,
      where: {
        ...(options.where as object),
        tenantId,
      } as FindOneOptions<T>['where'],
    });
  }

  async findMany(tenantId: string, options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find({
      ...options,
      where: {
        ...(options?.where as object),
        tenantId,
      } as FindManyOptions<T>['where'],
    });
  }

  async create(tenantId: string, data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create({ ...data, tenantId } as DeepPartial<T>);
    return this.repo.save(entity);
  }

  async save(entity: T): Promise<T> {
    return this.repo.save(entity);
  }

  async softDelete(tenantId: string, id: string): Promise<void> {
    await this.repo.update({ id, tenantId } as never, { deletedAt: new Date() } as never);
  }

  protected buildOutboxEntry(
    schema: string,
    eventType: string,
    tenantId: string,
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      event_type: eventType,
      tenant_id: tenantId,
      payload,
      created_at: new Date(),
      dispatched_at: null,
    };
  }
}
