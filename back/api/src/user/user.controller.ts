import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserQuery } from './queries/queries/get-user.query';
import { UpdateUserCommand } from './commands/commands/update-user.command';
import { UpdatePasswordCommand } from './commands/commands/update-password.command';
import { UpdateUserDto } from './commands/dto/update-user.dto';
import { UpdatePasswordDto } from './commands/dto/update-password.dto';
import {
  CacheInterceptor,
  CacheKey,
} from '../common/interceptors/cache.interceptor';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('user')
  async getMe(@Request() req) {
    return this.queryBus.execute(new GetUserQuery(req.user.userId));
  }

  @Patch('me')
  async updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(req.user.userId, dto));
  }

  @Patch('me/password')
  async updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.commandBus.execute(
      new UpdatePasswordCommand(req.user.userId, dto),
    );
  }
}
