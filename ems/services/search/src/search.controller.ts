import { Controller, Get, Param, ParseUUIDPipe, Query, UseInterceptors } from '@nestjs/common';

import { ApiResponseInterceptor } from '../../shared/src/api-response.interceptor';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';
import { SEARCH_INDEXES, SearchHit } from './search.types';

@UseInterceptors(ApiResponseInterceptor)
@Controller('api/v1/tenants/:tenantId/events/:eventId/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Query() query: SearchQueryDto,
  ): Promise<SearchHit[]> {
    const indexes = query.parseIndexes();

    return this.searchService.search(
      tenantId,
      eventId,
      query.q ?? '',
      indexes.length > 0 ? indexes : SEARCH_INDEXES,
      query.parseLimit(),
    );
  }
}
