import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiErrorResponse } from './api-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: Array<{ field?: string; issue: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) ?? message;

        // Map NestJS HTTP status to EMS error codes
        const codeMap: Record<number, string> = {
          400: 'VALIDATION_ERROR',
          401: 'UNAUTHENTICATED',
          403: 'FORBIDDEN',
          404: 'NOT_FOUND',
          409: 'CONFLICT',
          422: 'UNPROCESSABLE',
          429: 'RATE_LIMITED',
        };
        code = codeMap[status] ?? 'INTERNAL_ERROR';

        // class-validator validation errors
        if (Array.isArray(resp.message)) {
          message = 'Validation failed';
          details = (resp.message as string[]).map((issue) => ({ issue }));
        }
      }
    } else {
      this.logger.error('Unhandled exception', exception as Error);
    }

    const body: ApiErrorResponse = {
      error: { code, message, ...(details ? { details } : {}) },
      meta: { requestId: uuidv4(), timestamp: new Date().toISOString() },
    };

    response.status(status).json(body);
  }
}
