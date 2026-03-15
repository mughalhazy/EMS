import { Injectable, Logger } from '@nestjs/common';

import { DomainEvent } from './domain-event';

export interface EventSubscriber<TPayload = Record<string, unknown>> {
  eventType: string;
  handle(event: DomainEvent<TPayload>): Promise<void> | void;
}

@Injectable()
export class EventSubscriberRegistry {
  private readonly logger = new Logger(EventSubscriberRegistry.name);
  private readonly subscribers = new Map<string, EventSubscriber[]>();

  register(subscriber: EventSubscriber): void {
    const existing = this.subscribers.get(subscriber.eventType) ?? [];
    existing.push(subscriber);
    this.subscribers.set(subscriber.eventType, existing);
  }

  getSubscribers(eventType: string): EventSubscriber[] {
    return this.subscribers.get(eventType) ?? [];
  }

  async dispatch<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    const subscribers = this.getSubscribers(event.type);

    for (const subscriber of subscribers) {
      try {
        await subscriber.handle(event);
      } catch (error) {
        this.logger.error(
          JSON.stringify({
            event: 'event_bus.subscriber.failed',
            eventType: event.type,
            domainEventId: event.id,
            subscriber: subscriber.constructor.name,
            message: error instanceof Error ? error.message : 'Unknown subscriber error',
          }),
        );
        throw error;
      }
    }
  }
}
