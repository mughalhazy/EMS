import { SearchIndexName } from '../search.types';

export class SearchQueryDto {
  q!: string;
  indexes?: string;
  limit?: string;

  parseIndexes(): SearchIndexName[] {
    if (!this.indexes?.trim()) {
      return [];
    }

    return this.indexes
      .split(',')
      .map((index) => index.trim())
      .filter((index): index is SearchIndexName => ['events', 'sessions', 'speakers', 'attendees'].includes(index));
  }

  parseLimit(): number | undefined {
    if (!this.limit) {
      return undefined;
    }

    const parsed = Number.parseInt(this.limit, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
