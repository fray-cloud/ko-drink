import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { CreateUserCommand } from '../commands/create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand) {
    const { dto } = command;

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      provider: dto.provider,
      providerId: dto.providerId,
    });

    return user;
  }
}
