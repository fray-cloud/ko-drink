import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SearchController } from './search.controller';
import { GetSearchHandler } from './queries/handlers/get-search.handler';
import { KoreansoolCommonModule } from '../../common/koreansool/koreansool-common.module';

@Module({
  imports: [CqrsModule, KoreansoolCommonModule],
  controllers: [SearchController],
  providers: [GetSearchHandler],
})
export class SearchModule {}
