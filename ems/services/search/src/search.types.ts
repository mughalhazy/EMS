export const SEARCH_ADAPTER = Symbol('SEARCH_ADAPTER');

export const SEARCH_INDEXES = ['events', 'sessions', 'speakers', 'attendees'] as const;
export type SearchIndexName = (typeof SEARCH_INDEXES)[number];

export type SearchDocument = {
  tenantId: string;
  eventId: string;
  entityId: string;
  name: string;
  summary?: string;
  tags?: string[];
};

export type SearchHit = {
  index: SearchIndexName;
  score: number;
  entityId: string;
  name: string;
  summary?: string;
  tags: string[];
};

export interface SearchAdapter {
  ensureIndexes(indexNames: readonly SearchIndexName[]): Promise<void>;
  upsert(index: SearchIndexName, documentId: string, document: SearchDocument): Promise<void>;
  delete(index: SearchIndexName, documentId: string): Promise<void>;
  search(indexes: readonly SearchIndexName[], tenantId: string, eventId: string, query: string, limit: number): Promise<SearchHit[]>;
}
