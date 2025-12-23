import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';
import { RecipeStepDto } from '../../recipe/dto/recipe-response.dto';

export class SimilarRecipeItemDto {
  @ApiProperty({ description: '문헌명', example: '보덕공비망록' })
  book: string;

  @ApiProperty({ description: '술 이름', example: '삼해주' })
  liquor: string;

  @ApiProperty({
    description: '레시피 단계 목록',
    type: [RecipeStepDto],
  })
  recipe: RecipeStepDto[];
}

export class SimilarRecipesResponseDto {
  @ApiProperty({ description: '기준 문헌명', example: '보덕공비망록' })
  book: string;

  @ApiProperty({ description: '기준 술 이름', example: '삼해주' })
  liquor: string;

  @ApiProperty({ description: '중복 번호', example: 1 })
  dup: number;

  @ApiProperty({
    description: '유사 레시피 목록',
    type: [SimilarRecipeItemDto],
  })
  data: SimilarRecipeItemDto[];

  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

