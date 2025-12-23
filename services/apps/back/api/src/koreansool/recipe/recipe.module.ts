import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RecipeController } from './recipe.controller';
import { GetRecipeHandler } from './queries/handlers/get-recipe.handler';
import { KoreansoolCommonModule } from '../../common/koreansool/koreansool-common.module';

@Module({
  imports: [CqrsModule, KoreansoolCommonModule],
  controllers: [RecipeController],
  providers: [GetRecipeHandler],
})
export class RecipeModule {}
