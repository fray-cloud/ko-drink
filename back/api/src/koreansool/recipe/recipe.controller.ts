import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetRecipeQuery } from './queries/queries/get-recipe.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@Controller('koreansool/recipes')
export class RecipeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
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
