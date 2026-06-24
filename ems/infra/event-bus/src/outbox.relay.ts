import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventBusService } from './event-bus.service';
import { OutboxEntity } from './outbox.entity';
import { TopicName } from './topics';

@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);
  private processing = false;

  constructor(
    @InjectRepository(OutboxEntity)
    private readonly outboxRepo: Repository<OutboxEntity>,
    private readonly eventBus: EventBusService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async relay() {
    if (this.processing) return;
    this.processing = true;

    try {
      const pending = await this.outboxRepo.find({
        where: { dispatchedAt: IsNull() },
        order: { createdAt: 'ASC' },
        take: 100,
      });

      if (pending.length === 0) return;

      const messages = pending.map((row) => ({
        topic: row.eventType as TopicName,
        event: {
          eventType: row.eventType,
          tenantId: row.tenantId,
          payload: row.payload,
        },
      }));

      await this.eventBus.publishBatch(messages);

      const ids = pending.map((r) => r.id);
      await this.outboxRepo
        .createQueryBuilder()
        .update()
        .set({ dispatchedAt: new Date() })
        .whereInIds(ids)
        .execute();

      this.logger.debug(`Relayed ${pending.length} outbox event(s)`);
    } catch (err) {
      this.logger.error('Outbox relay error', err);
    } finally {
      this.processing = false;
    }
  }
}
