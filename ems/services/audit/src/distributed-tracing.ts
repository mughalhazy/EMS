import { randomBytes } from 'crypto';

export interface DistributedTraceContext {
  trace_id: string;
  span_id: string;
  parent_span_id?: string;
}

export type DistributedTraceCarrier = Partial<DistributedTraceContext> | null | undefined;

function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}

function generateSpanId(): string {
  return randomBytes(8).toString('hex');
}

export function buildDistributedTraceContext(parent?: DistributedTraceCarrier): DistributedTraceContext {
  return {
    trace_id: parent?.trace_id ?? generateTraceId(),
    span_id: generateSpanId(),
    ...(parent?.span_id ? { parent_span_id: parent.span_id } : {}),
  };
}

export function attachDistributedTrace<TPayload extends Record<string, unknown>>(
  payload: TPayload,
  parent?: DistributedTraceCarrier,
): TPayload & DistributedTraceContext {
  return {
    ...payload,
    ...buildDistributedTraceContext(parent),
  };
}

export function readDistributedTrace(payload: Record<string, unknown>): DistributedTraceCarrier {
  const traceId = typeof payload.trace_id === 'string' ? payload.trace_id : undefined;
  const spanId = typeof payload.span_id === 'string' ? payload.span_id : undefined;
  const parentSpanId = typeof payload.parent_span_id === 'string' ? payload.parent_span_id : undefined;

  if (!traceId || !spanId) {
    return undefined;
  }

  return {
    trace_id: traceId,
    span_id: spanId,
    ...(parentSpanId ? { parent_span_id: parentSpanId } : {}),
  };
}
