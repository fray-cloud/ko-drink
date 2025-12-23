import { Controller, Get, Query, UseInterceptors, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetBooksQuery } from './queries/queries/get-books.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';
import { BooksResponseDto } from './dto/books-response.dto';

@ApiTags('Koreansool - 문헌')
@Controller('koreansool/books')
export class BookController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '문헌 목록 조회' })
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
    description: '문헌 목록',
    type: BooksResponseDto,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('books')
  async getBooks(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.queryBus.execute(new GetBooksQuery(page, limit));
  }
}
