import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterLocalUserDto } from './commands/dto/register-local-user.dto';
import { LoginDto } from './commands/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterLocalUserDto) {
    return this.authService.registerLocal(dto.email, dto.password, dto.name);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    // Guard redirects
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Request() req, @Res() res) {
    const result = await this.authService.validateSocialUser(
      'naver',
      req.user.providerId,
      req.user.email,
      req.user.name,
    );
    res.redirect(`/?token=${result.access_token}`);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req, @Res() res) {
    const result = await this.authService.validateSocialUser(
      'google',
      req.user.providerId,
      req.user.email,
      req.user.name,
    );
    res.redirect(`/?token=${result.access_token}`);
  }

  @Get('daum')
  @UseGuards(AuthGuard('daum'))
  async daumAuth() {
    // Guard redirects
  }

  @Get('daum/callback')
  @UseGuards(AuthGuard('daum'))
  async daumAuthCallback(@Request() req, @Res() res) {
    const result = await this.authService.validateSocialUser(
      'daum',
      req.user.providerId,
      req.user.email,
      req.user.name,
    );
    res.redirect(`/?token=${result.access_token}`);
  }

  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
