import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBusService, TopicName } from '@ems/event-bus';
import { VectorEmbedding } from './entities/vector-embedding.entity';
import { AIInteractionLog } from './entities/ai-interaction-log.entity';

const EMBEDDABLE_EVENTS: Record<string, string> = {
  'attendee.created': 'attendee',
  'attendee.profile_updated': 'attendee',
  'session.created': 'session',
  'session.updated': 'session',
  'speaker.created': 'speaker',
  'speaker.updated': 'speaker',
  'event.created': 'event',
  'event.updated': 'event',
};

@Injectable()
export class AiService implements OnModuleInit {
  constructor(
    @InjectRepository(VectorEmbedding) private readonly embeddings: Repository<VectorEmbedding>,
    @InjectRepository(AIInteractionLog) private readonly logs: Repository<AIInteractionLog>,
    private readonly eventBus: EventBusService,
  ) {}

  async onModuleInit() {
    const topics = Object.keys(EMBEDDABLE_EVENTS) as TopicName[];
    await this.eventBus.subscribe('ai-service', topics, async (event) => {
      const { eventType, payload } = event as unknown as {
        eventType: string;
        payload: Record<string, unknown>;
      };
      const entityType = EMBEDDABLE_EVENTS[eventType];
      if (!entityType) return;
      const entityId =
        (payload[`${entityType}Id`] as string) ?? (payload['id'] as string);
      if (!entityId) return;
      await this.upsertEmbedding(entityType, entityId);
    });
  }

  private async upsertEmbedding(entityType: string, entityId: string) {
    let embedding = await this.embeddings.findOne({ where: { entityType, entityId } });
    if (!embedding) {
      embedding = this.embeddings.create({ entityType, entityId, vector: [] });
    }
    // Placeholder: a real implementation would call an embedding API here.
    embedding.vector = [];
    embedding.modelVersion = 'placeholder-v0';
    await this.embeddings.save(embedding);
    await this.eventBus.publish('embedding.updated', {
      eventType: 'embedding.updated',
      tenantId: 'system',
      payload: { entityType, entityId, modelVersion: embedding.modelVersion },
    });
  }

  async getEmbedding(entityType: string, entityId: string) {
    const embedding = await this.embeddings.findOne({ where: { entityType, entityId } });
    if (!embedding) throw new NotFoundException('Embedding not found');
    return embedding;
  }

  async logInteraction(
    tenantId: string,
    userId: string | undefined,
    prompt: string,
    response?: string,
    context?: Record<string, unknown>,
  ) {
    const log = this.logs.create({ tenantId, userId, prompt, response, context });
    return this.logs.save(log);
  }

  async listInteractions(tenantId: string, limit = 20) {
    return this.logs.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
