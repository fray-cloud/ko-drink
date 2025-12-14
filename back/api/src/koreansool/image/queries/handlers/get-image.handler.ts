import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetImageQuery } from '../queries/get-image.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';

@QueryHandler(GetImageQuery)
export class GetImageHandler implements IQueryHandler<GetImageQuery> {
  constructor(private readonly apiClient: KoreansoolApiClient) {}

  async execute(query: GetImageQuery) {
    const imageBuffer = await this.apiClient.getImage(
      query.book,
      query.liq,
      query.dup,
    );
    return imageBuffer;
  }
}
