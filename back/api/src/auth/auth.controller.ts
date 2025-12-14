import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterLocalUserDto } from './commands/dto/register-local-user.dto';
import { LoginDto } from './commands/dto/login.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private isProviderEnabled(provider: 'naver' | 'google' | 'kakao'): boolean {
    const authConfig = this.configService.get('auth');
    const config = authConfig?.[provider];
    return !!(config?.clientID && config?.clientSecret);
  }

  @Post('register')
  @ApiOperation({ summary: '로컬 회원가입' })
  @ApiBody({ type: RegisterLocalUserDto })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  async register(@Body() dto: RegisterLocalUserDto) {
    return this.authService.registerLocal(dto.email, dto.password, dto.name);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '로컬 로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('naver')
  @ApiOperation({ summary: '네이버 로그인 시작' })
  @ApiResponse({ status: 302, description: '네이버 인증 페이지로 리다이렉트' })
  @ApiResponse({ status: 404, description: '네이버 인증이 설정되지 않음' })
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    if (!this.isProviderEnabled('naver')) {
      throw new NotFoundException('Naver authentication is not configured');
    }
    // Guard redirects
  }

  @Get('naver/callback')
  @ApiOperation({ summary: '네이버 로그인 콜백' })
  @ApiResponse({ status: 302, description: '로그인 성공 후 리다이렉트' })
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Request() req, @Res() res) {
    if (!this.isProviderEnabled('naver')) {
      throw new NotFoundException('Naver authentication is not configured');
    }
    const result = await this.authService.validateSocialUser(
      'naver',
      req.user.providerId,
      req.user.email,
      req.user.name,
    );
    res.redirect(`/?token=${result.access_token}`);
  }

  @Get('google')
  @ApiOperation({ summary: '구글 로그인 시작' })
  @ApiResponse({ status: 302, description: '구글 인증 페이지로 리다이렉트' })
  @ApiResponse({ status: 404, description: '구글 인증이 설정되지 않음' })
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    if (!this.isProviderEnabled('google')) {
      throw new NotFoundException('Google authentication is not configured');
    }
    // Guard redirects
  }

  @Get('google/callback')
  @ApiOperation({ summary: '구글 로그인 콜백' })
  @ApiResponse({ status: 302, description: '로그인 성공 후 리다이렉트' })
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Request() req, @Res() res) {
    if (!this.isProviderEnabled('google')) {
      throw new NotFoundException('Google authentication is not configured');
    }
    const result = await this.authService.validateSocialUser(
      'google',
      req.user.providerId,
      req.user.email,
      req.user.name,
    );
    res.redirect(`/?token=${result.access_token}`);
  }

  @Get('kakao')
  @ApiOperation({ summary: '카카오 로그인 시작' })
  @ApiResponse({ status: 302, description: '카카오 인증 페이지로 리다이렉트' })
  @ApiResponse({ status: 404, description: '카카오 인증이 설정되지 않음' })
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    if (!this.isProviderEnabled('kakao')) {
      throw new NotFoundException('Kakao authentication is not configured');
    }
    // Guard redirects
  }

  @Get('kakao/callback')
  @ApiOperation({ summary: '카카오 로그인 콜백' })
  @ApiResponse({ status: 302, description: '로그인 성공 후 리다이렉트' })
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Request() req, @Res() res) {
    if (!this.isProviderEnabled('kakao')) {
      throw new NotFoundException('Kakao authentication is not configured');
    }
    const result = await this.authService.validateSocialUser(
      'kakao',
      req.user.providerId,
      req.user.email,
      req.user.name,
    );
    res.redirect(`/?token=${result.access_token}`);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
