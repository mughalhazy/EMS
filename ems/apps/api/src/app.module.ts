import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventBusModule } from '@ems/event-bus';
import { CacheModule } from '@ems/cache';
import { RequestLoggerMiddleware } from '@ems/common';
import { AuthModule } from '@ems/auth';
import { TenantModule } from '@ems/tenant';
import { RbacModule } from '@ems/rbac';
import { AuditModule } from '@ems/audit';
import { EventModule } from '@ems/event';
import { AgendaModule } from '@ems/agenda';
import { SpeakerModule } from '@ems/speaker';
import { ExhibitorModule } from '@ems/exhibitor';
import { AttendeeModule } from '@ems/attendee';
import { RegistrationModule } from '@ems/registration';
import { OnsiteModule } from '@ems/onsite';
import { TicketingModule } from '@ems/ticketing';
import { PricingModule } from '@ems/pricing';
import { InventoryModule } from '@ems/inventory';
import { OrderModule } from '@ems/order';
import { PaymentModule } from '@ems/payment';
import { FulfillmentModule } from '@ems/fulfillment';
import { NotificationModule } from '@ems/notification';
import { EngagementModule } from '@ems/engagement';
import { AnalyticsModule } from '@ems/analytics';
import { SearchModule } from '@ems/search';
import { NetworkingModule } from '@ems/networking';
import { InteractiveEngagementModule } from '@ems/interactive-engagement';
import { AiModule } from '@ems/ai-service';
import { IntegrationModule } from '@ems/integration';
import { HealthController } from './health/health.controller';
import { validateEnv } from './config/env.validation';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['infra/docker/.env', '.env'],
      validate: validateEnv,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        migrations: ['migrations/*.js'],
        migrationsRun: config.get('NODE_ENV') === 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),

    EventBusModule.forRoot({
      brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      clientId: 'ems-api',
    }),

    CacheModule.forRoot({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD,
    }),

    // Batch 1 — Platform Core
    AuthModule,
    TenantModule,
    RbacModule,
    AuditModule,

    // Batch 2 — Event Operations
    EventModule,
    AgendaModule,
    SpeakerModule,
    ExhibitorModule,
    AttendeeModule,

    // Batch 3 — Participation
    RegistrationModule,
    OnsiteModule,

    // Batch 4 — Commerce
    TicketingModule,
    PricingModule,
    InventoryModule,
    OrderModule,
    PaymentModule,
    FulfillmentModule,

    // Batch 5 — Engagement
    NotificationModule,
    EngagementModule,

    // Batch 6 — Analytics & Search
    AnalyticsModule,
    SearchModule,

    // Batch 8 — Social
    NetworkingModule,

    // Batch 9 — Interactive Engagement
    InteractiveEngagementModule,

    // Batch 10 — AI Layer
    AiModule,

    // Cross-cutting
    IntegrationModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
