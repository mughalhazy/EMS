import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ApiDataResponse<T> = {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
};

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, T | ApiDataResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | ApiDataResponse<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<{ headers?: Record<string, string | string[] | undefined> }>();
    const response = httpContext.getResponse<{ statusCode?: number }>();

    return next.handle().pipe(
      map((data) => {
        if (response?.statusCode === 204) {
          return data;
        }

        const requestIdHeader = request?.headers?.['x-request-id'];
        const requestId = Array.isArray(requestIdHeader)
          ? requestIdHeader[0]
          : requestIdHeader ?? 'generated-request-id';

        return {
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
