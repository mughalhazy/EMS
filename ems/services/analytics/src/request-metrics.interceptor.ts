import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { RequestMetricsService } from './request-metrics.service';

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  constructor(private readonly requestMetricsService: RequestMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const startedAt = process.hrtime.bigint();
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<{
      method?: string;
      route?: { path?: string };
      path?: string;
      originalUrl?: string;
    }>();
    const response = httpContext.getResponse<{ statusCode?: number }>();

    const method = (request.method ?? 'UNKNOWN').toUpperCase();
    const route = request.route?.path ?? request.path ?? request.originalUrl ?? 'unknown';

    const recordMetric = (statusCode: number): void => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      this.requestMetricsService.record({
        method,
        route,
        statusCode,
        latencyMs: durationMs,
      });
    };

    return next.handle().pipe(
      tap(() => {
        recordMetric(response.statusCode ?? 200);
      }),
      catchError((error: unknown) => {
        const statusCode = this.resolveStatusCode(error, response.statusCode);
        recordMetric(statusCode);

        return throwError(() => error);
      }),
    );
  }

  private resolveStatusCode(error: unknown, fallbackStatusCode?: number): number {
    if (error instanceof HttpException) {
      return error.getStatus();
    }

    if (typeof error === 'object' && error !== null && 'status' in error) {
      const status = (error as { status?: unknown }).status;
      if (typeof status === 'number') {
        return status;
      }
    }

    return fallbackStatusCode ?? 500;
  }
}
