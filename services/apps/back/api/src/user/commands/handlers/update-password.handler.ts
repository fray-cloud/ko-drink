import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { UpdatePasswordCommand } from '../commands/update-password.command';
import { PasswordUtil } from '@ko-drink/shared';

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordHandler implements ICommandHandler<UpdatePasswordCommand> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: UpdatePasswordCommand) {
    const { userId, dto } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.provider !== 'local') {
      throw new UnauthorizedException(
        'Password can only be changed for local users',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException('User has no password set');
    }

    const isCurrentPasswordValid = await PasswordUtil.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await PasswordUtil.hash(dto.newPassword);

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    return { success: true };
  }
}
