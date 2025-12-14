import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnalysisController } from './analysis.controller';
import { GetSimilarRecipesHandler } from './queries/handlers/get-similar-recipes.handler';
import { KoreansoolCommonModule } from '../../common/koreansool/koreansool-common.module';

@Module({
  imports: [CqrsModule, KoreansoolCommonModule],
  controllers: [AnalysisController],
  providers: [GetSimilarRecipesHandler],
})
export class AnalysisModule {}
