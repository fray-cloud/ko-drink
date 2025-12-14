import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SearchModule } from './koreansool/search/search.module';
import { BookModule } from './koreansool/book/book.module';
import { RecipeModule } from './koreansool/recipe/recipe.module';
import { ReferenceModule } from './koreansool/reference/reference.module';
import { ImageModule } from './koreansool/image/image.module';
import { AnalysisModule } from './koreansool/analysis/analysis.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    UserModule,
    SearchModule,
    BookModule,
    RecipeModule,
    ReferenceModule,
    ImageModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
