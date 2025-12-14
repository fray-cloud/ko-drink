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
    super({
      clientID: authConfig.kakao.clientID,
      clientSecret: authConfig.kakao.clientSecret,
      callbackURL: authConfig.kakao.callbackURL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    return {
      provider: 'kakao',
      providerId: profile.id,
      email: profile._json?.kakao_account?.email,
      name:
        profile._json?.kakao_account?.profile?.nickname || profile.displayName,
    };
  }
}
