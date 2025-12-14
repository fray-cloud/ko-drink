import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImageController } from './image.controller';
import { GetImageHandler } from './queries/handlers/get-image.handler';
import { KoreansoolCommonModule } from '../../common/koreansool/koreansool-common.module';

@Module({
  imports: [CqrsModule, KoreansoolCommonModule],
  controllers: [ImageController],
  providers: [GetImageHandler],
})
export class ImageModule {}
