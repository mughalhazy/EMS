import { Injectable } from '@nestjs/common';
import { RedisClient } from './redis.client';

const TTL_SECONDS = 86400; // 24 hours per api-standards.md §7

export interface IdempotencyRecord {
  statusCode: number;
  body: unknown;
}

@Injectable()
export class IdempotencyStore {
  constructor(private readonly redis: RedisClient) {}

  private key(tenantId: string, idempotencyKey: string): string {
    return `idem:${tenantId}:${idempotencyKey}`;
  }

  async get(tenantId: string, idempotencyKey: string): Promise<IdempotencyRecord | null> {
    const raw = await this.redis.get(this.key(tenantId, idempotencyKey));
    if (!raw) return null;
    return JSON.parse(raw) as IdempotencyRecord;
  }

  async set(tenantId: string, idempotencyKey: string, record: IdempotencyRecord): Promise<void> {
    await this.redis.set(this.key(tenantId, idempotencyKey), JSON.stringify(record), TTL_SECONDS);
  }

  async exists(tenantId: string, idempotencyKey: string): Promise<boolean> {
    return this.redis.exists(this.key(tenantId, idempotencyKey));
  }
}
