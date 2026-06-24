import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService, Topics, TopicName } from '@ems/event-bus';
import { WebhookSubscription } from './entities/webhook-subscription.entity';
import { CreateWebhookSubscriptionDto } from './dto/integration.dto';

// GAP-B15 fixed 2026-06-17: was a hardcoded 41-topic list missing 23 topics
const ALL_TOPICS = Object.values(Topics);

@Injectable()
export class IntegrationService implements OnModuleInit {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    @InjectRepository(WebhookSubscription)
    private readonly subscriptions: Repository<WebhookSubscription>,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe('integration-service', ALL_TOPICS as TopicName[], async (event) => {
      const { eventType, tenantId, payload } = event as unknown as {
        eventType: string;
        tenantId: string;
        payload: Record<string, unknown>;
      };
      const subs = await this.subscriptions.find({
        where: { tenantId, active: true },
      });
      for (const sub of subs) {
        if (!sub.eventTypes.includes(eventType)) continue;
        await this.deliver(sub, { eventType, tenantId, payload });
      }
    });
  }

  private async deliver(sub: WebhookSubscription, body: Record<string, unknown>) {
    try {
      const res = await fetch(sub.targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        this.logger.warn(
          `Webhook delivery to ${sub.targetUrl} failed with status ${res.status}`,
        );
      }
    } catch (err) {
      this.logger.error(`Webhook delivery to ${sub.targetUrl} errored: ${String(err)}`);
    }
  }

  async createSubscription(tenantId: string, dto: CreateWebhookSubscriptionDto) {
    const sub = this.subscriptions.create({ tenantId, ...dto });
    return this.subscriptions.save(sub);
  }

  async listSubscriptions(tenantId: string) {
    return this.subscriptions.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async deleteSubscription(id: string, tenantId: string) {
    const sub = await this.subscriptions.findOne({ where: { id, tenantId } });
    if (!sub) throw new NotFoundException('Webhook subscription not found');
    await this.subscriptions.remove(sub);
  }
}
