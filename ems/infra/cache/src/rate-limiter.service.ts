import { Injectable } from '@nestjs/common';
import { RedisClient } from './redis.client';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

@Injectable()
export class RateLimiterService {
  constructor(private readonly redis: RedisClient) {}

  /**
   * Sliding window rate limiter.
   * key:    unique identifier (e.g. `ratelimit:{tenantId}:{routeGroup}`)
   * limit:  max requests per window
   * windowSeconds: window size in seconds
   */
  async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const fullKey = `rl:${key}`;

    const pipeline = this.redis.client.pipeline();
    pipeline.zremrangebyscore(fullKey, '-inf', windowStart);
    pipeline.zadd(fullKey, now, `${now}-${Math.random()}`);
    pipeline.zcard(fullKey);
    pipeline.expire(fullKey, windowSeconds);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) ?? 0;
    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    return { allowed, remaining, resetInSeconds: windowSeconds };
  }
}
