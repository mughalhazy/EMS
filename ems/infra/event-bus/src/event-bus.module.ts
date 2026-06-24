import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventBusService } from './event-bus.service';
import { OutboxRelay } from './outbox.relay';
import { OutboxEntity } from './outbox.entity';

export interface EventBusModuleOptions {
  brokers: string[];
  clientId?: string;
}

@Module({})
export class EventBusModule {
  static forRoot(options: EventBusModuleOptions): DynamicModule {
    const eventBusServiceProvider = {
      provide: EventBusService,
      useFactory: () => new EventBusService(options.brokers, options.clientId),
    };

    return {
      module: EventBusModule,
      imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([OutboxEntity])],
      providers: [eventBusServiceProvider, OutboxRelay],
      exports: [EventBusService],
      global: true,
    };
  }
}
