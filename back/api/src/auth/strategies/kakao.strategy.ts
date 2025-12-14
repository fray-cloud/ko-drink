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

    // 환경 변수가 없으면 기본값으로 초기화 (사용되지 않음)
    if (!clientID || !clientSecret) {
      super({
        clientID: 'disabled',
        clientSecret: 'disabled',
        callbackURL:
          authConfig?.kakao?.callbackURL || '/api/auth/kakao/callback',
      });
    } else {
      super({
        clientID,
        clientSecret,
        callbackURL: authConfig.kakao.callbackURL,
      });
    }
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
