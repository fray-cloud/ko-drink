import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { GetRecipeQuery } from '../queries/get-recipe.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';
import { paginate } from '@ko-drink/shared';

@QueryHandler(GetRecipeQuery)
export class GetRecipeHandler implements IQueryHandler<GetRecipeQuery> {
  private readonly logger = new Logger(GetRecipeHandler.name);

  constructor(
    private readonly apiClient: KoreansoolApiClient,
    private readonly htmlParser: KoreansoolHtmlParser,
  ) {}

  async execute(query: GetRecipeQuery) {
    try {
      // dup가 없으면 기본값 1 사용
      const dup = query.dup ?? 1;
      this.logger.log(`[Recipe] Query: book=${query.book}, liq=${query.liq}, dup=${dup}`);
      
      const html = await this.apiClient.getRecipe(query.book, query.liq, dup);
      this.logger.log(`[Recipe] HTML received, length: ${html?.length || 0}`);

      // book만 있거나 liq만 있으면 모든 레시피 반환 (페이지네이션 적용)
      if ((query.book && !query.liq) || (!query.book && query.liq)) {
        this.logger.log(`[Recipe] Parsing all recipes (book only or liq only)`);
        let allRecipes = this.htmlParser.parseAllRecipes(html);
        this.logger.log(`[Recipe] Parsed ${allRecipes.length} recipes`);
        
        // materials가 빈 배열이고 step과 memo가 같은 경우, memo만 반환
        allRecipes = allRecipes.map((recipeInfo) => ({
          ...recipeInfo,
          recipe: recipeInfo.recipe.map((step) => {
            if (
              step.materials.length === 0 &&
              step.step &&
              step.memo &&
              step.step.trim() === step.memo.trim()
            ) {
              return {
                day: step.day,
                memo: step.memo,
              };
            }
            return step;
          }),
        }));
        
        if (allRecipes.length === 0) {
          // HTML 구조 확인
          const $ = cheerio.load(html);
          const tableEachCount = $('.table_each_rcp').length;
          const tableRcpCount = $('.table_rcp').length;
          const allTables = $('table').length;
          this.logger.warn(`[Recipe] No recipes found. .table_each_rcp: ${tableEachCount}, .table_rcp: ${tableRcpCount}, total tables: ${allTables}`);
          
          // 모든 테이블의 클래스 확인
          const tableClasses: string[] = [];
          $('table').each((_, table) => {
            const classes = $(table).attr('class') || '';
            if (classes) {
              tableClasses.push(classes);
            }
          });
          this.logger.log(`[Recipe] Table classes found: ${tableClasses.join(', ')}`);
          
          // body 내부의 모든 div 클래스 확인
          const divClasses: string[] = [];
          $('body div').each((_, div) => {
            const classes = $(div).attr('class') || '';
            if (classes && classes.includes('table')) {
              divClasses.push(classes);
            }
          });
          if (divClasses.length > 0) {
            this.logger.log(`[Recipe] Div classes with 'table': ${divClasses.slice(0, 10).join(', ')}`);
          }
          
          // HTML 미리보기 (더 많이) - 중간 부분과 끝 부분도 확인
          const htmlPreview = html.substring(0, 2000);
          const htmlMiddle = html.substring(html.length / 2 - 1000, html.length / 2 + 1000);
          const htmlEnd = html.substring(html.length - 2000);
          this.logger.log(`[Recipe] HTML preview (start): ${htmlPreview}...`);
          this.logger.log(`[Recipe] HTML preview (middle): ${htmlMiddle}...`);
          this.logger.log(`[Recipe] HTML preview (end): ${htmlEnd}`);
          
          // 모든 테이블의 구조 확인
          $('table').each((idx, table) => {
            if (idx < 5) { // 처음 5개만
              const $table = $(table);
              const classes = $table.attr('class') || 'no-class';
              const firstRow = $table.find('tr').first().html()?.substring(0, 200) || '';
              this.logger.log(`[Recipe] Table ${idx} (class: ${classes}): ${firstRow}...`);
            }
          });
        }
        
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        return paginate(allRecipes, page, limit);
      }

      // 둘 다 있으면 단일 레시피 반환
      this.logger.log(`[Recipe] Parsing single recipe`);
      let recipe = this.htmlParser.parseRecipe(html);
      const metadata = this.htmlParser.parseRecipeMetadata(html);
      const metaInfo = this.htmlParser.parseRecipeMetaInfo(html);
      
      // materials가 빈 배열이고 step과 memo가 같은 경우, memo만 반환
      recipe = recipe.map((step) => {
        if (
          step.materials.length === 0 &&
          step.step &&
          step.memo &&
          step.step.trim() === step.memo.trim()
        ) {
          return {
            day: step.day,
            memo: step.memo,
          };
        }
        return step;
      });
      
      // 상세 페이지에서는 원문 텍스트도 가져오기
      // 이미 가져온 HTML을 재사용하여 성능 최적화
      let originalText: string | undefined;
      try {
        originalText = await this.apiClient.getOriginalText(
          metadata?.book || query.book || '',
          metadata?.liquor || query.liq || '',
          dup,
          html, // 이미 가져온 HTML 재사용
        );
        if (!originalText || originalText.length === 0) {
          originalText = undefined;
        }
      } catch (error) {
        this.logger.warn(`[Recipe] Failed to fetch original text: ${error.message}`);
        originalText = undefined;
      }

      return {
        book: metadata?.book || query.book || undefined,
        liquor: metadata?.liquor || query.liq || undefined,
        dup,
        recipe,
        ...metaInfo,
        originalText,
      };
    } catch (error) {
      this.logger.error(`[Recipe] Error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
