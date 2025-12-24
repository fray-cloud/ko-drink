import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  BadRequestException,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { GetRecipeQuery } from './queries/queries/get-recipe.query';
import {
  CacheInterceptor,
  CacheKey,
} from '../../common/interceptors/cache.interceptor';
import { RecipeResponseDto, RecipeListResponseDto } from './dto/recipe-response.dto';

@ApiTags('Koreansool - 레시피')
@Controller('koreansool/recipes')
export class RecipeController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: '레시피 조회',
    description:
      'book과 liq를 모두 제공하면 단일 레시피를 반환합니다. book만 제공하면 해당 문헌의 모든 레시피를 배열로 반환합니다. liq만 제공하면 해당 술의 모든 레시피를 배열로 반환합니다.',
  })
  @ApiQuery({
    name: 'book',
    description:
      '문헌명 (선택). book만 제공하면 해당 문헌의 모든 레시피를 배열로 반환합니다. book과 liq 중 하나 이상은 필수입니다.',
    required: false,
    type: String,
    example: '보덕공비망록',
  })
  @ApiQuery({
    name: 'liq',
    description:
      '술 이름 (선택). liq만 제공하면 해당 술의 모든 레시피를 배열로 반환합니다. book과 liq 중 하나 이상은 필수입니다.',
    required: false,
    type: String,
    example: '삼해주',
  })
  @ApiQuery({
    name: 'dup',
    description:
      '중복 번호. 같은 문헌(book)과 같은 술 이름(liq)을 가진 레시피가 여러 개일 때 구분하는 번호입니다. 예를 들어 같은 문헌에 "삼해주"가 여러 번 등장하면 dup=1, dup=2 등으로 구분합니다. 생략 시 기본값 1이 사용됩니다. book만 또는 liq만 제공할 때는 무시됩니다.',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (book만 또는 liq만 제공할 때만 사용)',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 항목 수 (book만 또는 liq만 제공할 때만 사용)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description:
      '레시피 정보. book과 liq를 모두 제공하면 단일 레시피 객체를 반환하고, 하나만 제공하면 레시피 배열을 반환합니다.',
    type: RecipeResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: '레시피 목록 (book만 또는 liq만 제공할 때)',
    type: RecipeListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'book과 liq 중 하나 이상은 필수입니다.',
  })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('recipe')
  async getRecipe(
    @Query('book') book?: string,
    @Query('liq') liq?: string,
    @Query('dup') dup?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    // book과 liq 중 하나 이상은 필수
    if (!book && !liq) {
      throw new BadRequestException('book과 liq 중 하나 이상은 필수입니다.');
    }

    return this.queryBus.execute(
      new GetRecipeQuery(
        book,
        liq,
        dup !== undefined ? parseInt(dup.toString(), 10) : undefined,
        page,
        limit,
      ),
    );
  }
}
