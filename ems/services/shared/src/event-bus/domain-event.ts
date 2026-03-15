import { randomUUID } from 'crypto';

export type DomainEventMetadata = {
  correlationId?: string;
  causationId?: string;
  traceId?: string;
  [key: string]: string | number | boolean | null | undefined;
};

export type DomainEvent<TPayload = Record<string, unknown>> = {
  id: string;
  type: string;
  aggregateType: string;
  aggregateId: string;
  tenantId: string;
  occurredAt: string;
  payload: TPayload;
  metadata?: DomainEventMetadata;
  partitionKey?: string;
};

export type DomainEventFactoryInput<TPayload> = Omit<
  DomainEvent<TPayload>,
  'id' | 'occurredAt'
> & {
  id?: string;
  occurredAt?: string;
};

export const createDomainEvent = <TPayload>(
  input: DomainEventFactoryInput<TPayload>,
): DomainEvent<TPayload> => ({
  ...input,
  id: input.id ?? randomUUID(),
  occurredAt: input.occurredAt ?? new Date().toISOString(),
});
