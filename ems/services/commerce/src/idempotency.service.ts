import { Injectable } from '@nestjs/common';

interface IdempotencyEntry<T> {
  response: T;
  expiresAt: number;
}

@Injectable()
export class IdempotencyService {
  private readonly entries = new Map<string, IdempotencyEntry<unknown>>();

  async execute<T>(scope: string, idempotencyKey: string, ttlMs: number, work: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cacheKey = `${scope}:${idempotencyKey.trim()}`;
    const existing = this.entries.get(cacheKey) as IdempotencyEntry<T> | undefined;

    if (existing && existing.expiresAt > now) {
      return existing.response;
    }

    const response = await work();
    this.entries.set(cacheKey, { response, expiresAt: now + ttlMs });
    this.cleanup(now);

    return response;
  }

  private cleanup(now: number): void {
    for (const [key, entry] of this.entries.entries()) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
      }
    }
  }
}
