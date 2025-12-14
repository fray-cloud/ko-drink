import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import type { Provider } from '../../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsEnum(['naver', 'google', 'daum', 'local'])
  provider: Provider;

  @IsString()
  providerId: string;
}
