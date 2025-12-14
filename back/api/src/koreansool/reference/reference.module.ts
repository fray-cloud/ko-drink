import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReferenceController } from './reference.controller';
import { GetReferencesHandler } from './queries/handlers/get-references.handler';
import { KoreansoolApiClient } from '../../common/utils/koreansool-api.client';

@Module({
  imports: [CqrsModule],
  controllers: [ReferenceController],
  providers: [GetReferencesHandler, KoreansoolApiClient],
})
export class ReferenceModule {}
