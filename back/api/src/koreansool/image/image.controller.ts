import { Controller, Get, Query, Res, UseInterceptors } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { GetImageQuery } from './queries/queries/get-image.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';

@Controller('koreansool/images')
export class ImageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
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
