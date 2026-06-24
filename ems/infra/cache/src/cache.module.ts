import { DynamicModule, Module } from '@nestjs/common';
import { RedisOptions } from 'ioredis';
import { RedisClient } from './redis.client';
import { RateLimiterService } from './rate-limiter.service';
import { IdempotencyStore } from './idempotency.store';
import { LockService } from './lock.service';

export interface CacheModuleOptions extends RedisOptions {
  host: string;
  port: number;
  password?: string;
}

@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOptions): DynamicModule {
    const redisClientProvider = {
      provide: RedisClient,
      useFactory: () => new RedisClient(options),
    };

    return {
      module: CacheModule,
      providers: [redisClientProvider, RateLimiterService, IdempotencyStore, LockService],
      exports: [RedisClient, RateLimiterService, IdempotencyStore, LockService],
      global: true,
    };
  }
}
