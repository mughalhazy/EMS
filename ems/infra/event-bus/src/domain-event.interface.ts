export interface DomainEvent<T = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  tenantId: string;
  occurredAt: string; // ISO8601
  payload: T;
}
