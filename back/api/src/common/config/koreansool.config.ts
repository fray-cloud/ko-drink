import { registerAs } from '@nestjs/config';

export default registerAs('koreansool', () => ({
  baseUrl: process.env.KOREANSOOL_API_BASE_URL || 'http://koreansool.kr/ktw/php',
}));
