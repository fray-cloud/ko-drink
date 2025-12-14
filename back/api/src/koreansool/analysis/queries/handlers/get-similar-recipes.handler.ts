import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetSimilarRecipesQuery } from '../queries/get-similar-recipes.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';

@QueryHandler(GetSimilarRecipesQuery)
export class GetSimilarRecipesHandler implements IQueryHandler<GetSimilarRecipesQuery> {
  constructor(
    private readonly apiClient: KoreansoolApiClient,
    private readonly htmlParser: KoreansoolHtmlParser,
  ) {}

  async execute(query: GetSimilarRecipesQuery) {
    const html = await this.apiClient.getSimilarRecipes(
      query.book,
      query.liq,
      query.dup,
    );
    const results = this.htmlParser.parseSearchResults(html);
    return {
      book: query.book,
      liquor: query.liq,
      dup: query.dup,
      similarRecipes: results,
      count: results.length,
    };
  }
}
