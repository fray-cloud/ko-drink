import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DaumAuthStrategy extends PassportStrategy(Strategy, 'daum') {
  constructor(private readonly configService: ConfigService) {
    const authConfig = configService.get('auth');
    super({
      authorizationURL: 'https://apis.daum.net/oauth2/authorize',
      tokenURL: 'https://apis.daum.net/oauth2/token',
      clientID: authConfig.daum.clientID,
      clientSecret: authConfig.daum.clientSecret,
      callbackURL: authConfig.daum.callbackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    try {
      const response = await axios.get(
        'https://apis.daum.net/user/v1/show.json',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const profile = response.data;
      return {
        provider: 'daum',
        providerId: profile.id,
        email: profile.email,
        name: profile.nickname || profile.name,
      };
    } catch (error) {
      return null;
    }
  }
}
