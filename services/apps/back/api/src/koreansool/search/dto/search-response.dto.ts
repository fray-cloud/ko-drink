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

  @ApiProperty({
    description: '술 이름 한자',
    required: false,
    example: '甘香酒',
  })
  liquorHanja?: string;

  @ApiProperty({
    description: '설명',
    required: false,
    example: '달고 향기로운 술',
  })
  description?: string;

  @ApiProperty({
    description: '분류 태그',
    required: false,
    type: [String],
    example: ['발효주', '순곡주', '단양주', '느림'],
  })
  tags?: string[];

  @ApiProperty({
    description: '별칭',
    required: false,
    example: '이화주',
  })
  alias?: string;

  @ApiProperty({
    description: '유사 문헌',
    required: false,
    example: '잡초',
  })
  similarBook?: string;

  @ApiProperty({
    description: '원문 텍스트',
    required: false,
    example: '원문 내용...',
  })
  originalText?: string;
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

