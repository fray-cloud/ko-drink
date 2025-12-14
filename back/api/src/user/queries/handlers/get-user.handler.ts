import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { GetUserQuery } from '../queries/get-user.query';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetUserQuery) {
    const user = await this.userRepository.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
