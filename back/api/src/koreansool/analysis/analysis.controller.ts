import { Controller, Get, Query, UseInterceptors, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetSimilarRecipesQuery } from './queries/queries/get-similar-recipes.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';
import { SimilarRecipesResponseDto } from './dto/similar-recipes-response.dto';

@ApiTags('Koreansool - 분석')
@Controller('koreansool/analysis')
export class AnalysisController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('similar')
  @ApiOperation({ summary: '유사 레시피 조회' })
  @ApiQuery({ name: 'book', description: '문헌명', required: true })
  @ApiQuery({ name: 'liq', description: '술 이름', required: true })
  @ApiQuery({
    name: 'dup',
    description:
      '중복 번호 (필수). 같은 문헌(book)과 같은 술 이름(liq)을 가진 레시피가 여러 개일 때 구분하는 번호입니다. 예를 들어 같은 문헌에 "삼해주"가 여러 번 등장하면 dup=1, dup=2 등으로 구분합니다. 이 엔드포인트에서는 중복 번호가 필수입니다.',
    required: true,
    type: Number,
    example: 1,
  })
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
    description: '유사 레시피 목록',
    type: SimilarRecipesResponseDto,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('similar')
  async getSimilarRecipes(
    @Query('book') book: string,
    @Query('liq') liq: string,
    @Query('dup') dup: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.queryBus.execute(
      new GetSimilarRecipesQuery(
        book,
        liq,
        parseInt(dup.toString(), 10),
        page,
        limit,
      ),
    );
  }
}
