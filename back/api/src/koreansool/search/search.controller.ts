import { Controller, Get, Query, UseInterceptors, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetSearchQuery } from './queries/queries/get-search.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';
import { SearchResponseDto } from './dto/search-response.dto';

@ApiTags('Koreansool - 검색')
@Controller('koreansool/search')
export class SearchController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '레시피 검색' })
  @ApiQuery({ name: 'q', description: '검색어', required: true })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 항목 수',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과',
    type: SearchResponseDto,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('search')
  async search(
    @Query('q') searchText: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.queryBus.execute(new GetSearchQuery(searchText, page, limit));
  }
}
