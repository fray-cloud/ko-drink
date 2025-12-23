import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: '이름', example: '홍길동', required: false })
  @IsString()
  @IsOptional()
  name?: string;
}
