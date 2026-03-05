import { Inject, Injectable, Optional } from '@nestjs/common';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export interface RedisClient {
  set(
    key: string,
    value: string,
    mode: 'NX',
    ttlMode: 'PX',
    ttl: number,
  ): Promise<'OK' | null>;
  eval(script: string, keyCount: number, ...args: string[]): Promise<number>;
}

@Injectable()
export class RedisLockService {
  constructor(@Optional() @Inject(REDIS_CLIENT) private readonly redisClient?: RedisClient) {}

  async withLock<T>(
    key: string,
    ttlMs: number,
    work: () => Promise<T>,
  ): Promise<T> {
    if (!this.redisClient) {
      return work();
    }

    const lockToken = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const lockKey = `lock:${key}`;

    const acquired = await this.redisClient.set(lockKey, lockToken, 'NX', 'PX', ttlMs);
    if (acquired !== 'OK') {
      throw new Error(`Unable to acquire lock for ${key}`);
    }

    try {
      return await work();
    } finally {
      await this.redisClient.eval(
        `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `,
        1,
        lockKey,
        lockToken,
      );
    }
  }
}
