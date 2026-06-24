import { LoggerService } from '@nestjs/common';

interface LogEntry {
  level: string;
  message: string;
  context?: string;
  timestamp: string;
  trace?: string;
}

/**
 * Structured (one JSON object per line) logger for production environments,
 * where log aggregators (e.g. CloudWatch, Loki) expect machine-parseable output.
 */
export class JsonLogger implements LoggerService {
  log(message: unknown, ...optionalParams: unknown[]) {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.write('verbose', message, optionalParams);
  }

  private write(level: string, message: unknown, optionalParams: unknown[]) {
    const last = optionalParams[optionalParams.length - 1];
    const context = typeof last === 'string' ? last : undefined;
    const trace =
      level === 'error' && typeof optionalParams[0] === 'string'
        ? (optionalParams[0] as string)
        : undefined;

    const entry: LogEntry = {
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      context,
      timestamp: new Date().toISOString(),
      ...(trace ? { trace } : {}),
    };
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }
}
