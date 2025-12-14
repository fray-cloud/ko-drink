import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  naver: {
    clientID: process.env.NAVER_CLIENT_ID || '',
    clientSecret: process.env.NAVER_CLIENT_SECRET || '',
    callbackURL: process.env.NAVER_CALLBACK_URL || '/api/auth/naver/callback',
  },
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  },
  kakao: {
    clientID: process.env.KAKAO_CLIENT_ID || '',
    clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
    callbackURL: process.env.KAKAO_CALLBACK_URL || '/api/auth/kakao/callback',
  },
  password: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
  },
}));
