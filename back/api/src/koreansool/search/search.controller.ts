import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetSearchQuery } from './queries/queries/get-search.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@ApiTags('Koreansool - 검색')
@Controller('koreansool/search')
export class SearchController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '레시피 검색' })
  @ApiQuery({ name: 'q', description: '검색어', required: true })
  @ApiResponse({ status: 200, description: '검색 결과' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('search')
  async search(@Query('q') searchText: string) {
    return this.queryBus.execute(new GetSearchQuery(searchText));
  }
}
