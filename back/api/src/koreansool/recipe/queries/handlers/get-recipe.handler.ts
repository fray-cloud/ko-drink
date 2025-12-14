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
    const html = await this.apiClient.getRecipe(
      query.book,
      query.liq,
      query.dup,
    );
    const recipe = this.htmlParser.parseRecipe(html);
    return {
      book: query.book,
      liquor: query.liq,
      dup: query.dup,
      recipe,
    };
  }
}
