import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../repositories/user.repository';
import { GetUserByProviderQuery } from '../queries/get-user-by-provider.query';

@QueryHandler(GetUserByProviderQuery)
export class GetUserByProviderHandler implements IQueryHandler<GetUserByProviderQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByProviderQuery) {
    return this.userRepository.findByProvider(query.provider, query.providerId);
  }
}
