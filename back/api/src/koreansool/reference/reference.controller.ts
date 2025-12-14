import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetReferencesQuery } from './queries/queries/get-references.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@Controller('koreansool/references')
export class ReferenceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('references')
  async getReferences() {
    return this.queryBus.execute(new GetReferencesQuery());
  }
}
