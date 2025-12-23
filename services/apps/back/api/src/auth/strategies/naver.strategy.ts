import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as NaverStrategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverAuthStrategy extends PassportStrategy(
  NaverStrategy,
  'naver',
) {
  constructor(private readonly configService: ConfigService) {
    const authConfig = configService.get('auth');
    const clientID = authConfig?.naver?.clientID;
    const clientSecret = authConfig?.naver?.clientSecret;

    // super()는 항상 첫 번째로 호출되어야 함
    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL:
        authConfig?.naver?.callbackURL || '/api/auth/naver/callback',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const authConfig = this.configService.get('auth');
    if (
      !authConfig?.naver?.clientID ||
      authConfig.naver.clientID === 'disabled'
    ) {
      return null;
    }
    return {
      provider: 'naver',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
    };
  }
}
