import { Module } from '@nestjs/common';

import { OpenSearchSearchAdapter } from './adapters/opensearch-search.adapter';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SEARCH_ADAPTER } from './search.types';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    OpenSearchSearchAdapter,
    {
      provide: SEARCH_ADAPTER,
      useExisting: OpenSearchSearchAdapter,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
