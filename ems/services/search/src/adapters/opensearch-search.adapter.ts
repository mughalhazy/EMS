import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';

import { environmentConfig } from '../../../shared/src/environment-config';
import { SEARCH_INDEXES, SearchAdapter, SearchDocument, SearchHit, SearchIndexName } from '../search.types';

@Injectable()
export class OpenSearchSearchAdapter implements SearchAdapter {
  private readonly logger = new Logger(OpenSearchSearchAdapter.name);
  private readonly client: Client | null;
  private readonly indexPrefix = environmentConfig.getOrDefault('SEARCH_INDEX_PREFIX', 'ems');
  private indexesReady = false;

  constructor() {
    const node = environmentConfig.get('OPENSEARCH_NODE');
    if (!node) {
      this.client = null;
      this.logger.warn(JSON.stringify({ event: 'search.disabled', reason: 'missing_opensearch_node' }));
      return;
    }

    this.client = new Client({
      node,
      auth:
        environmentConfig.get('OPENSEARCH_USERNAME') && environmentConfig.get('OPENSEARCH_PASSWORD')
          ? {
              username: environmentConfig.getOrDefault('OPENSEARCH_USERNAME', ''),
              password: environmentConfig.getOrDefault('OPENSEARCH_PASSWORD', ''),
            }
          : undefined,
      ssl:
        !environmentConfig.getBoolean('OPENSEARCH_TLS_REJECT_UNAUTHORIZED', true)
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  async ensureIndexes(indexNames: readonly SearchIndexName[]): Promise<void> {
    if (!this.client || this.indexesReady) {
      return;
    }

    try {
      for (const indexName of indexNames) {
        const concreteIndexName = this.getIndexName(indexName);
        const exists = await this.client.indices.exists({ index: concreteIndexName });

        if (exists.body) {
          continue;
        }

        await this.client.indices.create({
          index: concreteIndexName,
          body: {
            mappings: {
              properties: {
                tenantId: { type: 'keyword' },
                eventId: { type: 'keyword' },
                entityId: { type: 'keyword' },
                name: { type: 'text' },
                summary: { type: 'text' },
                tags: { type: 'keyword' },
              },
            },
          },
        });
      }

      this.indexesReady = true;
    } catch (error) {
      this.logger.warn(
        JSON.stringify({ event: 'search.ensure_indexes_failed', error: (error as Error).message, indexNames }),
      );
    }
  }

  async upsert(index: SearchIndexName, documentId: string, document: SearchDocument): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureIndexes(SEARCH_INDEXES);

    try {
      await this.client.index({
        index: this.getIndexName(index),
        id: documentId,
        body: document,
        refresh: true,
      });
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'search.upsert_failed',
          index,
          documentId,
          error: (error as Error).message,
        }),
      );
    }
  }

  async delete(index: SearchIndexName, documentId: string): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.ensureIndexes(SEARCH_INDEXES);

    try {
      await this.client.delete({
        index: this.getIndexName(index),
        id: documentId,
        refresh: true,
      });
    } catch (error) {
      this.logger.warn(
        JSON.stringify({
          event: 'search.delete_failed',
          index,
          documentId,
          error: (error as Error).message,
        }),
      );
    }
  }

  async search(
    indexes: readonly SearchIndexName[],
    tenantId: string,
    eventId: string,
    query: string,
    limit: number,
  ): Promise<SearchHit[]> {
    if (!this.client || !query.trim()) {
      return [];
    }

    await this.ensureIndexes(SEARCH_INDEXES);

    try {
      const response = await this.client.search({
        index: indexes.map((indexName) => this.getIndexName(indexName)),
        body: {
          size: limit,
          query: {
            bool: {
              filter: [{ term: { tenantId } }, { term: { eventId } }],
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['name^3', 'summary', 'tags^2'],
                    fuzziness: 'AUTO',
                  },
                },
              ],
            },
          },
        },
      });

      return response.body.hits.hits.map((hit: { _index: string; _score: number; _source: SearchDocument }) => {
        const index = this.getLogicalIndexName(hit._index);

        return {
          index,
          score: hit._score ?? 0,
          entityId: hit._source.entityId,
          name: hit._source.name,
          summary: hit._source.summary,
          tags: hit._source.tags ?? [],
        };
      });
    } catch (error) {
      this.logger.warn(JSON.stringify({ event: 'search.query_failed', error: (error as Error).message }));
      return [];
    }
  }

  private getIndexName(index: SearchIndexName): string {
    return `${this.indexPrefix}-${index}`;
  }

  private getLogicalIndexName(indexName: string): SearchIndexName {
    const index = indexName.replace(`${this.indexPrefix}-`, '') as SearchIndexName;

    return SEARCH_INDEXES.includes(index) ? index : 'events';
  }
}
