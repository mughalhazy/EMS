import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class RequestCacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = this.store.get(key) as CacheEntry<T> | undefined;

    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const value = await loader();
    this.store.set(key, { value, expiresAt: now + ttlMs });
    this.cleanup(now);

    return value;
  }

  private cleanup(now: number): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }
}
