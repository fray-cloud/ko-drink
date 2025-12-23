import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReferenceController } from './reference.controller';
import { GetReferencesHandler } from './queries/handlers/get-references.handler';
import { KoreansoolCommonModule } from '../../common/koreansool/koreansool-common.module';

@Module({
  imports: [CqrsModule, KoreansoolCommonModule],
  controllers: [ReferenceController],
  providers: [GetReferencesHandler],
})
export class ReferenceModule {}
