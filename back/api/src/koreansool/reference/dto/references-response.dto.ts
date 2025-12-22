import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/paginated-response.dto';

export class ReferenceItemDto {
  @ApiProperty({
    description: '참조 ID',
    required: false,
    example: 'ref-001',
  })
  id?: string;

  @ApiProperty({
    description: '참조 제목',
    required: false,
    example: '한국 전통주 제조법',
  })
  title?: string;

  @ApiProperty({
    description: '참조 내용',
    required: false,
    example: '상세 설명...',
  })
  content?: string;

  @ApiProperty({
    description: '카테고리',
    required: false,
    example: '제조법',
  })
  category?: string;

  @ApiProperty({
    description: '링크',
    required: false,
    example: 'https://example.com/reference',
  })
  link?: string;
}

export class ReferencesResponseDto {
  @ApiProperty({
    description: '참조 정보 목록',
    type: [ReferenceItemDto],
  })
  data: ReferenceItemDto[];

  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

