import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetBooksQuery } from './queries/queries/get-books.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@Controller('koreansool/books')
export class BookController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('books')
  async getBooks() {
    return this.queryBus.execute(new GetBooksQuery());
  }
}
