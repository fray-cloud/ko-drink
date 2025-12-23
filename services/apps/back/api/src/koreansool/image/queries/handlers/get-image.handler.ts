import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetImageQuery } from '../queries/get-image.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';

@QueryHandler(GetImageQuery)
export class GetImageHandler implements IQueryHandler<GetImageQuery> {
  constructor(private readonly apiClient: KoreansoolApiClient) {}

  async execute(query: GetImageQuery) {
    // dup가 없으면 기본값 1 사용
    const dup = query.dup ?? 1;
    const imageBuffer = await this.apiClient.getImage(
      query.book,
      query.liq,
      dup,
    );
    return imageBuffer;
  }
}
