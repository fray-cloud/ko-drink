import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../repositories/user.repository';
import { GetUserByEmailQuery } from '../queries/get-user-by-email.query';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserByEmailQuery) {
    return this.userRepository.findByEmail(query.email);
  }
}
