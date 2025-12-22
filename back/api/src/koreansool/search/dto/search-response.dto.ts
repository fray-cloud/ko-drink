import { ApiProperty } from '@nestjs/swagger';
import { RecipeStepDto } from '../../recipe/dto/recipe-response.dto';
import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';

export class SearchResultItemDto {
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

export class SearchResponseDto {
  @ApiProperty({
    description: '검색 결과 목록',
    type: [SearchResultItemDto],
  })
  data: SearchResultItemDto[];

  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

