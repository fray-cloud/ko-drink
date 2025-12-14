import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetRecipeQuery } from './queries/queries/get-recipe.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@ApiTags('Koreansool - 레시피')
@Controller('koreansool/recipes')
export class RecipeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '레시피 상세 조회' })
  @ApiQuery({ name: 'book', description: '문헌명', required: true })
  @ApiQuery({ name: 'liq', description: '술 이름', required: true })
  @ApiQuery({ name: 'dup', description: '중복 번호', required: false })
  @ApiResponse({ status: 200, description: '레시피 상세 정보' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('recipe')
  async getRecipe(
    @Query('book') book: string,
    @Query('liq') liq: string,
    @Query('dup') dup?: number,
  ) {
    return this.queryBus.execute(
      new GetRecipeQuery(
        book,
        liq,
        dup ? parseInt(dup.toString(), 10) : undefined,
      ),
    );
  }
}
