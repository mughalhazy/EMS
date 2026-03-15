import { Inject, Injectable } from '@nestjs/common';

import { SEARCH_ADAPTER, SEARCH_INDEXES, SearchAdapter, SearchDocument, SearchHit, SearchIndexName } from './search.types';

@Injectable()
export class SearchService {
  constructor(@Inject(SEARCH_ADAPTER) private readonly searchAdapter: SearchAdapter) {}

  async upsertEvent(documentId: string, document: SearchDocument): Promise<void> {
    await this.searchAdapter.upsert('events', documentId, document);
  }

  async upsertSession(documentId: string, document: SearchDocument): Promise<void> {
    await this.searchAdapter.upsert('sessions', documentId, document);
  }

  async upsertSpeaker(documentId: string, document: SearchDocument): Promise<void> {
    await this.searchAdapter.upsert('speakers', documentId, document);
  }

  async upsertAttendee(documentId: string, document: SearchDocument): Promise<void> {
    await this.searchAdapter.upsert('attendees', documentId, document);
  }

  async deleteFromIndex(index: SearchIndexName, documentId: string): Promise<void> {
    await this.searchAdapter.delete(index, documentId);
  }

  async search(
    tenantId: string,
    eventId: string,
    query: string,
    indexes: readonly SearchIndexName[] = SEARCH_INDEXES,
    limit = 25,
  ): Promise<SearchHit[]> {
    const safeLimit = Math.max(1, Math.min(limit, 100));

    return this.searchAdapter.search(indexes, tenantId, eventId, query, safeLimit);
  }
}
