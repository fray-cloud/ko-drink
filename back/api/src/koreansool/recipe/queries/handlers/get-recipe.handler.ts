import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetRecipeQuery } from '../queries/get-recipe.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';

@QueryHandler(GetRecipeQuery)
export class GetRecipeHandler implements IQueryHandler<GetRecipeQuery> {
  constructor(
    private readonly apiClient: KoreansoolApiClient,
    private readonly htmlParser: KoreansoolHtmlParser,
  ) {}

  async execute(query: GetRecipeQuery) {
    // dup가 없으면 기본값 1 사용
    const dup = query.dup ?? 1;
    const html = await this.apiClient.getRecipe(query.book, query.liq, dup);

    // book만 있거나 liq만 있으면 모든 레시피 반환
    if ((query.book && !query.liq) || (!query.book && query.liq)) {
      const allRecipes = this.htmlParser.parseAllRecipes(html);
      return allRecipes;
    }

    // 둘 다 있으면 단일 레시피 반환
    const recipe = this.htmlParser.parseRecipe(html);
    const metadata = this.htmlParser.parseRecipeMetadata(html);

    return {
      book: metadata?.book || query.book || undefined,
      liquor: metadata?.liquor || query.liq || undefined,
      dup,
      recipe,
    };
  }
}
