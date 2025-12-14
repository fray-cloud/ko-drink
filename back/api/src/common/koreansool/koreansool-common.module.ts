import { Module, Global } from '@nestjs/common';
import { KoreansoolApiClient } from '../utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../utils/koreansool-html.parser';

@Global()
@Module({
  providers: [KoreansoolApiClient, KoreansoolHtmlParser],
  exports: [KoreansoolApiClient, KoreansoolHtmlParser],
})
export class KoreansoolCommonModule {}
