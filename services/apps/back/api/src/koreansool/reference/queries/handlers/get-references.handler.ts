import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetReferencesQuery } from '../queries/get-references.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';
import { paginate } from '@ko-drink/shared';

@QueryHandler(GetReferencesQuery)
export class GetReferencesHandler implements IQueryHandler<GetReferencesQuery> {
  constructor(
    private readonly apiClient: KoreansoolApiClient,
    private readonly htmlParser: KoreansoolHtmlParser,
  ) {}

  async execute(query: GetReferencesQuery) {
    const html = await this.apiClient.getReferences();
    const references = this.htmlParser.parseReferences(html);
    return paginate(references, query.page, query.limit);
  }
}
