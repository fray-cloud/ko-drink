import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(
  GoogleStrategy,
  'google',
) {
  constructor(private readonly configService: ConfigService) {
    const authConfig = configService.get('auth');
    const clientID = authConfig?.google?.clientID;
    const clientSecret = authConfig?.google?.clientSecret;

    // super()는 항상 첫 번째로 호출되어야 함
    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL:
        authConfig?.google?.callbackURL || '/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const authConfig = this.configService.get('auth');
    if (
      !authConfig?.google?.clientID ||
      authConfig.google.clientID === 'disabled'
    ) {
      return null;
    }
    return {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
    };
  }
}
