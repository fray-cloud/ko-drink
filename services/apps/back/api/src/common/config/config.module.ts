import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import jwtConfig from './jwt.config';
import koreansoolConfig from './koreansool.config';
import authConfig from './auth.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, koreansoolConfig, authConfig],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class ConfigModule {}
