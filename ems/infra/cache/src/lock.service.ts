import { Injectable, Logger } from '@nestjs/common';
import { RedisClient } from './redis.client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LockService {
  private readonly logger = new Logger(LockService.name);

  constructor(private readonly redis: RedisClient) {}

  /**
   * Acquire a distributed lock (SET NX EX).
   * Returns the lock token if acquired, null if not.
   */
  async acquire(resource: string, ttlSeconds: number): Promise<string | null> {
    const token = uuidv4();
    const key = `lock:${resource}`;
    const result = await this.redis.client.set(key, token, 'EX', ttlSeconds, 'NX');
    if (result === 'OK') return token;
    return null;
  }

  /**
   * Release a lock only if we hold it (Lua script for atomicity).
   */
  async release(resource: string, token: string): Promise<boolean> {
    const key = `lock:${resource}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = (await this.redis.client.eval(script, 1, key, token)) as number;
    return result === 1;
  }

  /**
   * Run a function while holding a distributed lock.
   * Throws if lock cannot be acquired.
   */
  async withLock<T>(resource: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const token = await this.acquire(resource, ttlSeconds);
    if (!token) {
      throw new Error(`Could not acquire lock on resource: ${resource}`);
    }
    try {
      return await fn();
    } finally {
      const released = await this.release(resource, token);
      if (!released) {
        this.logger.warn(`Lock expired before release for resource: ${resource}`);
      }
    }
  }
}
