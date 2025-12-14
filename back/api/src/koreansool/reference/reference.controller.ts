import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetReferencesQuery } from './queries/queries/get-references.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@ApiTags('Koreansool - 참조')
@Controller('koreansool/references')
export class ReferenceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '참조 정보 조회' })
  @ApiResponse({ status: 200, description: '참조 정보' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('references')
  async getReferences() {
    return this.queryBus.execute(new GetReferencesQuery());
  }
}
