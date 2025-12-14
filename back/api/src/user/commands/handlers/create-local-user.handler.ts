import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { CreateLocalUserCommand } from '../commands/create-local-user.command';
import { PasswordUtil } from '../../../common/utils/password.util';
import { ConfigService } from '@nestjs/config';

@CommandHandler(CreateLocalUserCommand)
export class CreateLocalUserHandler implements ICommandHandler<CreateLocalUserCommand> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateLocalUserCommand) {
    const { dto } = command;

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const authConfig = this.configService.get('auth');
    const hashedPassword = await PasswordUtil.hash(
      dto.password,
      authConfig.password.saltRounds,
    );

    const user = await this.userRepository.create({
      email: dto.email,
      name: dto.name,
      provider: 'local',
      providerId: dto.email,
      password: hashedPassword,
    });

    return user;
  }
}
