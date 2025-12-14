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
  @ApiQuery({ name: 'dup', description: '중복 번호', required: true })
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
    @Query('dup') dup: number,
    @Res() res: Response,
  ) {
    const imageBuffer = await this.queryBus.execute(
      new GetImageQuery(
        book,
        liq,
        dup ? parseInt(dup.toString(), 10) : undefined,
      ),
    );
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  }
}
