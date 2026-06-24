import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer, KafkaConfig, logLevel } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { DomainEvent } from './domain-event.interface';
import { TopicName } from './topics';

@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private readonly kafka: Kafka;
  private producer: Producer;
  private readonly consumers: Consumer[] = [];
  private connected = false;

  constructor(brokers: string[], clientId = 'ems-api') {
    const config: KafkaConfig = {
      clientId,
      brokers,
      logLevel: logLevel.WARN,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    };
    this.kafka = new Kafka(config);
    this.producer = this.kafka.producer({
      idempotent: true,
      maxInFlightRequests: 5,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
    this.connected = true;
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    this.connected = false;
    await this.producer.disconnect();
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
    this.logger.log('Kafka producer and consumers disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async publish<T>(
    topic: TopicName,
    event: Omit<DomainEvent<T>, 'eventId' | 'occurredAt'>,
  ): Promise<void> {
    const domainEvent: DomainEvent<T> = {
      eventId: uuidv4(),
      occurredAt: new Date().toISOString(),
      ...event,
    } as DomainEvent<T>;

    await this.producer.send({
      topic,
      messages: [
        {
          key: event.tenantId,
          value: JSON.stringify(domainEvent),
          headers: {
            eventType: event.eventType,
            eventId: domainEvent.eventId,
          },
        },
      ],
    });

    this.logger.debug(`Published ${event.eventType} to ${topic}`);
  }

  async publishBatch(
    messages: Array<{ topic: TopicName; event: Omit<DomainEvent, 'eventId' | 'occurredAt'> }>,
  ): Promise<void> {
    const topicMessages = messages.map(({ topic, event }) => {
      const domainEvent: DomainEvent = {
        eventId: uuidv4(),
        occurredAt: new Date().toISOString(),
        ...event,
      };
      return {
        topic,
        messages: [
          {
            key: event.tenantId,
            value: JSON.stringify(domainEvent),
            headers: { eventType: event.eventType, eventId: domainEvent.eventId },
          },
        ],
      };
    });

    await this.producer.sendBatch({ topicMessages });
  }

  async subscribe(
    groupId: string,
    topics: TopicName[],
    handler: (event: DomainEvent, topic: string) => Promise<void>,
  ): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });
    this.consumers.push(consumer);

    await consumer.connect();
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() ?? '{}') as DomainEvent;
          await handler(event, topic);
        } catch (err) {
          this.logger.error(`Failed to process message on ${topic}`, err);
        }
      },
    });

    this.logger.log(`Consumer group [${groupId}] subscribed to: ${topics.join(', ')}`);
  }
}
