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
    super({
      clientID: authConfig.naver.clientID,
      clientSecret: authConfig.naver.clientSecret,
      callbackURL: authConfig.naver.callbackURL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    return {
      provider: 'naver',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
    };
  }
}
