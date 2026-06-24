import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RedisClient } from '@ems/cache';
import { EventBusService } from '@ems/event-bus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly redis: RedisClient,
    private readonly eventBus: EventBusService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — checks Postgres, Redis, and Kafka connectivity' })
  async ready() {
    const checks = {
      database: false,
      redis: false,
      kafka: this.eventBus.isConnected(),
    };

    try {
      await this.dataSource.query('SELECT 1');
      checks.database = true;
    } catch {
      checks.database = false;
    }

    try {
      const pong = await this.redis.client.ping();
      checks.redis = pong === 'PONG';
    } catch {
      checks.redis = false;
    }

    const healthy = Object.values(checks).every(Boolean);
    if (!healthy) {
      throw new ServiceUnavailableException({ status: 'unavailable', checks });
    }
    return { status: 'ok', checks, timestamp: new Date().toISOString() };
  }
}
