import { DynamicModule, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventSubscriberRegistry } from './event-subscriber';
import { KafkaEventPublisher } from './event-publisher';
import { OutboxEventEntity } from './outbox-event.entity';
import { OutboxService } from './outbox.service';

export type EventBusModuleOptions = {
  kafkaClientProvider?: Provider;
};

@Module({})
export class EventBusModule {
  static forRoot(options: EventBusModuleOptions = {}): DynamicModule {
    const providers: Provider[] = [
      EventSubscriberRegistry,
      KafkaEventPublisher,
      OutboxService,
      ...(options.kafkaClientProvider ? [options.kafkaClientProvider] : []),
    ];

    return {
      module: EventBusModule,
      imports: [TypeOrmModule.forFeature([OutboxEventEntity])],
      providers,
      exports: [
        EventSubscriberRegistry,
        KafkaEventPublisher,
        OutboxService
      ],
    };
  }
}
