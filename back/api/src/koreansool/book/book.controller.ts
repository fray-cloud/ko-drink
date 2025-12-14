import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetBooksQuery } from './queries/queries/get-books.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@ApiTags('Koreansool - 문헌')
@Controller('koreansool/books')
export class BookController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '문헌 목록 조회' })
  @ApiResponse({ status: 200, description: '문헌 목록' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('books')
  async getBooks() {
    return this.queryBus.execute(new GetBooksQuery());
  }
}
