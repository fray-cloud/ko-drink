import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ttl: {
    koreansool: parseInt(process.env.REDIS_TTL_KOREANSOOL || '3600', 10),
    user: parseInt(process.env.REDIS_TTL_USER || '1800', 10),
  },
}));
