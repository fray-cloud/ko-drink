import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NaverAuthStrategy } from './strategies/naver.strategy';
import { GoogleAuthStrategy } from './strategies/google.strategy';
import { DaumAuthStrategy } from './strategies/daum.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule,
    CqrsModule,
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    NaverAuthStrategy,
    GoogleAuthStrategy,
    DaumAuthStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
