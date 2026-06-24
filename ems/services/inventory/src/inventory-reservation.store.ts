import { Injectable } from '@nestjs/common';
import { RedisClient } from '@ems/cache';
import { v4 as uuidv4 } from 'uuid';

export interface InventoryReservation {
  id: string;
  tenantId: string;
  ticketProductId: string;
  orderId: string;
  quantity: number;
  expiresAt: Date;
}

const KEY_PREFIX = 'inv:reservation:';
const DEFAULT_TTL_SECONDS = 15 * 60; // 15-minute hold

@Injectable()
export class InventoryReservationStore {
  constructor(private readonly redis: RedisClient) {}

  async create(
    tenantId: string,
    ticketProductId: string,
    orderId: string,
    quantity: number,
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<InventoryReservation> {
    const id = uuidv4();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const record: InventoryReservation = { id, tenantId, ticketProductId, orderId, quantity, expiresAt };
    await this.redis.set(`${KEY_PREFIX}${id}`, JSON.stringify(record), ttlSeconds);
    return record;
  }

  async get(id: string): Promise<InventoryReservation | null> {
    const raw = await this.redis.get(`${KEY_PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InventoryReservation;
    parsed.expiresAt = new Date(parsed.expiresAt);
    return parsed;
  }

  async release(id: string): Promise<void> {
    await this.redis.del(`${KEY_PREFIX}${id}`);
  }
}
