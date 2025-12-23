import { Controller, Get, Query, Res, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { GetImageQuery } from './queries/queries/get-image.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@ApiTags('Koreansool - 이미지')
@Controller('koreansool/images')
export class ImageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: '원본 이미지 조회' })
  @ApiQuery({ name: 'book', description: '문헌명', required: true })
  @ApiQuery({ name: 'liq', description: '술 이름', required: true })
  @ApiQuery({
    name: 'dup',
    description:
      '중복 번호. 같은 문헌(book)과 같은 술 이름(liq)을 가진 레시피가 여러 개일 때 구분하는 번호입니다. 예를 들어 같은 문헌에 "삼해주"가 여러 번 등장하면 dup=1, dup=2 등으로 구분합니다. 생략 시 기본값 1이 사용됩니다.',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '이미지 파일',
    type: 'application/octet-stream',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('image')
  async getImage(
    @Query('book') book: string,
    @Query('liq') liq: string,
    @Query('dup') dup: number | undefined,
    @Res() res: Response,
  ) {
    const imageBuffer = await this.queryBus.execute(
      new GetImageQuery(book, liq, dup ? parseInt(dup.toString(), 10) : 1),
    );
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  }
}
