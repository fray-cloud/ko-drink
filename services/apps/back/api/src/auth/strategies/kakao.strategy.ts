import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoAuthStrategy extends PassportStrategy(
  KakaoStrategy,
  'kakao',
) {
  constructor(private readonly configService: ConfigService) {
    const authConfig = configService.get('auth');
    const clientID = authConfig?.kakao?.clientID;
    const clientSecret = authConfig?.kakao?.clientSecret;

    // super()는 항상 첫 번째로 호출되어야 함
    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL:
        authConfig?.kakao?.callbackURL || '/api/auth/kakao/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const authConfig = this.configService.get('auth');
    if (
      !authConfig?.kakao?.clientID ||
      authConfig.kakao.clientID === 'disabled'
    ) {
      return null;
    }
    return {
      provider: 'kakao',
      providerId: profile.id,
      email: profile._json?.kakao_account?.email,
      name:
        profile._json?.kakao_account?.profile?.nickname || profile.displayName,
    };
  }
}
