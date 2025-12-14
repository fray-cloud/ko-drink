import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetSearchQuery } from '../queries/get-search.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';

@QueryHandler(GetSearchQuery)
export class GetSearchHandler implements IQueryHandler<GetSearchQuery> {
  constructor(
    private readonly apiClient: KoreansoolApiClient,
    private readonly htmlParser: KoreansoolHtmlParser,
  ) {}

  async execute(query: GetSearchQuery) {
    const html = await this.apiClient.getSearchResults(query.searchText);
    const results = this.htmlParser.parseSearchResults(html);
    return {
      results,
      count: results.length,
    };
  }
}
