import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';

export class RecipeMaterialDto {
  @ApiProperty({ description: '재료명', example: '쌀' })
  materialName: string;

  @ApiProperty({ description: '재료량', example: '1말' })
  value: string;
}

export class RecipeStepDto {
  @ApiProperty({ description: '단계 설명', example: '쌀을 씻어서 담근다', required: false })
  step?: string;

  @ApiProperty({ description: '일수', example: 1 })
  day: number;

  @ApiProperty({
    description: '재료 목록',
    type: [RecipeMaterialDto],
    required: false,
  })
  materials?: RecipeMaterialDto[];

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

  @ApiProperty({
    description: '원문 해석',
    required: false,
    example: '원문 해석 내용...',
  })
  originalTextTranslation?: string;

  @ApiProperty({
    description: '상세 주방문 링크',
    required: false,
    example: {
      href: '/api/koreansool/recipes',
      params: {
        book: '승부리안주방문',
        liquor: '백수환동국',
        dup: 1,
      },
    },
  })
  detailRecipe?: {
    href: string;
    params: {
      book: string;
      liquor: string;
      dup?: number;
    };
  };
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

  @ApiProperty({
    description: '원문 해석',
    required: false,
    example: '원문 해석 내용...',
  })
  originalTextTranslation?: string;

  @ApiProperty({
    description: '상세 주방문 링크',
    required: false,
    example: {
      href: '/api/koreansool/recipes',
      params: {
        book: '승부리안주방문',
        liquor: '백수환동국',
        dup: 1,
      },
    },
  })
  detailRecipe?: {
    href: string;
    params: {
      book: string;
      liquor: string;
      dup?: number;
    };
  };
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

