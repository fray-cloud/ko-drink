import { Controller, Get, Query, UseInterceptors, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetReferencesQuery } from './queries/queries/get-references.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';
import { ReferencesResponseDto } from './dto/references-response.dto';

@ApiTags('Koreansool - 참조')
@Controller('koreansool/references')
export class ReferenceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '참조 정보 조회' })
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
    description: '참조 정보',
    type: ReferencesResponseDto,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('references')
  async getReferences(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.queryBus.execute(new GetReferencesQuery(page, limit));
  }
}
