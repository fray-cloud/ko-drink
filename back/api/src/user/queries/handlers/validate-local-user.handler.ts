import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { ValidateLocalUserQuery } from '../queries/validate-local-user.query';
import { PasswordUtil } from '../../../common/utils/password.util';

@QueryHandler(ValidateLocalUserQuery)
export class ValidateLocalUserHandler implements IQueryHandler<ValidateLocalUserQuery> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: ValidateLocalUserQuery) {
    const user = await this.userRepository.findByEmail(query.email);

    if (!user || user.provider !== 'local' || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await PasswordUtil.compare(
      query.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
