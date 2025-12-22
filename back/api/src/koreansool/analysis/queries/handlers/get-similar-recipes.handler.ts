import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetSimilarRecipesQuery } from '../queries/get-similar-recipes.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';
import { paginate } from '../../../../common/utils/pagination.util';

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
    const paginated = paginate(results, query.page, query.limit);
    
    return {
      book: query.book,
      liquor: query.liq,
      dup: query.dup,
      data: paginated.data,
      meta: paginated.meta,
    };
  }
}
