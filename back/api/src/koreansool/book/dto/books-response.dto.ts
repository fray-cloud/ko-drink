import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';

export class BookItemDto {
  @ApiProperty({ description: '문헌명', example: '보덕공비망록' })
  name: string;

  @ApiProperty({
    description: '문헌명 한자',
    required: false,
    example: '補德公備忘錄',
  })
  nameHanja?: string;

  @ApiProperty({
    description: '저자',
    required: false,
    example: '이덕수',
  })
  author?: string;

  @ApiProperty({
    description: '연도',
    required: false,
    example: 1800,
  })
  year?: number;

  @ApiProperty({
    description: '설명',
    required: false,
    example: '조선 후기 문헌',
  })
  description?: string;

  @ApiProperty({
    description: '원본 링크',
    required: false,
    example: 'https://example.com/original',
  })
  originalLink?: string;

  @ApiProperty({
    description: '참조 링크',
    required: false,
    example: 'https://example.com/reference',
  })
  referenceLink?: string;

  @ApiProperty({
    description: '레시피 링크',
    required: false,
    example: 'https://example.com/recipe',
  })
  recipeLink?: string;
}

export class BooksResponseDto {
  @ApiProperty({
    description: '문헌 목록',
    type: [BookItemDto],
  })
  data: BookItemDto[];

  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

