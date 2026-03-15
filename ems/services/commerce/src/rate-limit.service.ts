import { Injectable, TooManyRequestsException } from '@nestjs/common';

interface WindowEntry {
  windowStartMs: number;
  count: number;
}

@Injectable()
export class RateLimitService {
  private readonly windows = new Map<string, WindowEntry>();

  assertWithinLimit(key: string, maxRequests: number, windowMs: number): void {
    const now = Date.now();
    const current = this.windows.get(key);

    if (!current || now - current.windowStartMs >= windowMs) {
      this.windows.set(key, { windowStartMs: now, count: 1 });
      this.cleanup(now, windowMs);
      return;
    }

    if (current.count >= maxRequests) {
      throw new TooManyRequestsException('Rate limit exceeded. Please retry shortly.');
    }

    current.count += 1;
    this.windows.set(key, current);
  }

  private cleanup(now: number, maxWindowMs: number): void {
    for (const [key, value] of this.windows.entries()) {
      if (now - value.windowStartMs >= maxWindowMs) {
        this.windows.delete(key);
      }
    }
  }
}
