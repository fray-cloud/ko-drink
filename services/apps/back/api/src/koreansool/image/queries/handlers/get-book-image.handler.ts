import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBookImageQuery } from '../queries/get-book-image.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';

@QueryHandler(GetBookImageQuery)
export class GetBookImageHandler implements IQueryHandler<GetBookImageQuery> {
  constructor(private readonly apiClient: KoreansoolApiClient) {}

  async execute(query: GetBookImageQuery) {
    const imageBuffer = await this.apiClient.getBookImage(query.bookName);
    return imageBuffer;
  }
}

