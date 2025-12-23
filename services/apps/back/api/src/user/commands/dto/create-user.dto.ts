import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import type { Provider } from '@ko-drink/shared';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsEnum(['naver', 'google', 'kakao', 'local'])
  provider: Provider;

  @IsString()
  providerId: string;
}
