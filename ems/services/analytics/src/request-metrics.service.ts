import { Injectable } from '@nestjs/common';

export interface RequestMetricSample {
  method: string;
  route: string;
  statusCode: number;
  latencyMs: number;
}

export interface RequestMetricAggregate {
  method: string;
  route: string;
  requests: number;
  errors: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  lastStatusCode: number;
  lastLatencyMs: number;
  errorRate: number;
}

@Injectable()
export class RequestMetricsService {
  private readonly metrics = new Map<string, RequestMetricAggregate>();

  record(sample: RequestMetricSample): void {
    const key = this.buildMetricKey(sample.method, sample.route);

    const existing = this.metrics.get(key);
    if (!existing) {
      const errors = this.isErrorStatus(sample.statusCode) ? 1 : 0;

      this.metrics.set(key, {
        method: sample.method,
        route: sample.route,
        requests: 1,
        errors,
        totalLatencyMs: sample.latencyMs,
        avgLatencyMs: sample.latencyMs,
        minLatencyMs: sample.latencyMs,
        maxLatencyMs: sample.latencyMs,
        lastStatusCode: sample.statusCode,
        lastLatencyMs: sample.latencyMs,
        errorRate: errors,
      });

      return;
    }

    existing.requests += 1;
    existing.totalLatencyMs += sample.latencyMs;
    existing.avgLatencyMs = existing.totalLatencyMs / existing.requests;
    existing.minLatencyMs = Math.min(existing.minLatencyMs, sample.latencyMs);
    existing.maxLatencyMs = Math.max(existing.maxLatencyMs, sample.latencyMs);
    existing.lastStatusCode = sample.statusCode;
    existing.lastLatencyMs = sample.latencyMs;

    if (this.isErrorStatus(sample.statusCode)) {
      existing.errors += 1;
    }

    existing.errorRate = existing.errors / existing.requests;
    this.metrics.set(key, existing);
  }

  getAll(): RequestMetricAggregate[] {
    return [...this.metrics.values()].sort((left, right) => {
      if (left.route === right.route) {
        return left.method.localeCompare(right.method);
      }

      return left.route.localeCompare(right.route);
    });
  }

  reset(): void {
    this.metrics.clear();
  }

  private buildMetricKey(method: string, route: string): string {
    return `${method.toUpperCase()}::${route}`;
  }

  private isErrorStatus(statusCode: number): boolean {
    return statusCode >= 400;
  }
}
