import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetSimilarRecipesQuery } from './queries/queries/get-similar-recipes.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@Controller('koreansool/analysis')
export class AnalysisController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('similar')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('similar')
  async getSimilarRecipes(
    @Query('book') book: string,
    @Query('liq') liq: string,
    @Query('dup') dup: number,
  ) {
    return this.queryBus.execute(
      new GetSimilarRecipesQuery(book, liq, parseInt(dup.toString(), 10)),
    );
  }
}
