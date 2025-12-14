import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetReferencesQuery } from '../queries/get-references.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';

@QueryHandler(GetReferencesQuery)
export class GetReferencesHandler implements IQueryHandler<GetReferencesQuery> {
  constructor(private readonly apiClient: KoreansoolApiClient) {}

  async execute(query: GetReferencesQuery) {
    const html = await this.apiClient.getReferences();
    return {
      html,
    };
  }
}
