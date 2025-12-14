import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetSearchQuery } from './queries/queries/get-search.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@Controller('koreansool/search')
export class SearchController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('search')
  async search(@Query('q') searchText: string) {
    return this.queryBus.execute(new GetSearchQuery(searchText));
  }
}
