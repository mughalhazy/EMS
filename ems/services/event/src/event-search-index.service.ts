import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

import { EventEntity } from './entities/event.entity';
import { VenueEntity } from './entities/venue.entity';

type IndexedEventDocument = {
  tenantId: string;
  eventId: string;
  name: string;
  location: string;
  date: string;
};

@Injectable()
export class EventSearchIndexService {
  private readonly logger = new Logger(EventSearchIndexService.name);
  private readonly indexName = process.env.EVENT_SEARCH_INDEX_NAME ?? 'events';
  private readonly client: Client | null;
  private indexReady = false;

  constructor() {
    const node = process.env.OPENSEARCH_NODE;
    if (!node) {
      this.client = null;
      this.logger.warn('OPENSEARCH_NODE is not set. Event search indexing is disabled.');
      return;
    }

    this.client = new Client({
      node,
      auth:
        process.env.OPENSEARCH_USERNAME && process.env.OPENSEARCH_PASSWORD
          ? {
              username: process.env.OPENSEARCH_USERNAME,
              password: process.env.OPENSEARCH_PASSWORD,
            }
          : undefined,
      ssl:
        process.env.OPENSEARCH_TLS_REJECT_UNAUTHORIZED === 'false'
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  async upsertEvent(event: EventEntity, venues: VenueEntity[]): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureIndex();

    const document: IndexedEventDocument = {
      tenantId: event.tenantId,
      eventId: event.id,
      name: event.name,
      location: this.buildLocation(venues),
      date: event.startAt.toISOString(),
    };

    try {
      await this.client.index({
        index: this.indexName,
        id: event.id,
        body: document,
        refresh: true,
      });
    } catch (error) {
      this.logger.warn(`Failed to index event '${event.id}'. ${(error as Error).message}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureIndex();

    try {
      await this.client.delete({
        index: this.indexName,
        id: eventId,
        refresh: true,
      });
    } catch (error) {
      this.logger.warn(`Failed to delete indexed event '${eventId}'. ${(error as Error).message}`);
    }
  }

  private async ensureIndex(): Promise<void> {
    if (!this.client || this.indexReady) {
      return;
    }

    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (!exists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                tenantId: { type: 'keyword' },
                eventId: { type: 'keyword' },
                name: { type: 'text' },
                location: { type: 'text' },
                date: { type: 'date' },
              },
            },
          },
        });
      }

      this.indexReady = true;
    } catch (error) {
      this.logger.warn(
        `Failed to ensure OpenSearch index '${this.indexName}'. ${(error as Error).message}`,
      );
    }
  }

  private buildLocation(venues: VenueEntity[]): string {
    const locationParts = venues.flatMap((venue) => [
      venue.name,
      venue.addressLine1,
      venue.city,
      venue.country,
      venue.virtualUrl,
    ]);

    return locationParts.filter((part): part is string => Boolean(part?.trim())).join(', ');
  }
}
