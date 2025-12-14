import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookController } from './book.controller';
import { GetBooksHandler } from './queries/handlers/get-books.handler';
import { KoreansoolCommonModule } from '../../common/koreansool/koreansool-common.module';

@Module({
  imports: [CqrsModule, KoreansoolCommonModule],
  controllers: [BookController],
  providers: [GetBooksHandler],
})
export class BookModule {}
