import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';

export class RecipeMaterialDto {
  @ApiProperty({ description: '재료명', example: '쌀' })
  materialName: string;

  @ApiProperty({ description: '재료량', example: '1말' })
  value: string;
}

export class RecipeStepDto {
  @ApiProperty({ description: '단계 설명', example: '쌀을 씻어서 담근다' })
  step: string;

  @ApiProperty({ description: '일수', example: 1 })
  day: number;

  @ApiProperty({
    description: '재료 목록',
    type: [RecipeMaterialDto],
  })
  materials: RecipeMaterialDto[];

  @ApiProperty({
    description: '메모',
    required: false,
    example: '참고사항',
  })
  memo?: string;
}

export class RecipeItemDto {
  @ApiProperty({ description: '문헌명', example: '보덕공비망록' })
  book: string;

  @ApiProperty({ description: '술 이름', example: '삼해주' })
  liquor: string;

  @ApiProperty({ description: '중복 번호', example: 1 })
  dup: number;

  @ApiProperty({
    description: '레시피 단계 목록',
    type: [RecipeStepDto],
  })
  recipe: RecipeStepDto[];
}

export class RecipeResponseDto {
  @ApiProperty({ description: '문헌명', example: '보덕공비망록', required: false })
  book?: string;

  @ApiProperty({ description: '술 이름', example: '삼해주', required: false })
  liquor?: string;

  @ApiProperty({ description: '중복 번호', example: 1, required: false })
  dup?: number;

  @ApiProperty({
    description: '레시피 단계 목록',
    type: [RecipeStepDto],
    required: false,
  })
  recipe?: RecipeStepDto[];
}

export class RecipeListResponseDto {
  @ApiProperty({
    description: '레시피 목록',
    type: [RecipeItemDto],
  })
  data: RecipeItemDto[];

  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

