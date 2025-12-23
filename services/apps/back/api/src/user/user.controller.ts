import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('사용자')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('user')
  async getMe(@Request() req) {
    return this.queryBus.execute(new GetUserQuery(req.user.userId));
  }

  @Patch('me')
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: '사용자 정보 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async updateMe(@Request() req, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(req.user.userId, dto));
  }

  @Patch('me/password')
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 현재 비밀번호 불일치',
  })
  async updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {
    return this.commandBus.execute(
      new UpdatePasswordCommand(req.user.userId, dto),
    );
  }
}
