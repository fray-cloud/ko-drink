import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { GetSearchQuery } from '../queries/get-search.query';
import { KoreansoolApiClient } from '../../../../common/utils/koreansool-api.client';
import { KoreansoolHtmlParser } from '../../../../common/utils/koreansool-html.parser';
import { paginate } from '@ko-drink/shared';

@QueryHandler(GetSearchQuery)
export class GetSearchHandler implements IQueryHandler<GetSearchQuery> {
  private readonly logger = new Logger(GetSearchHandler.name);

  constructor(
    private readonly apiClient: KoreansoolApiClient,
    private readonly htmlParser: KoreansoolHtmlParser,
  ) {}

  async execute(query: GetSearchQuery) {
    try {
      this.logger.log(`[Search] Searching for: ${query.searchText}`);
      const html = await this.apiClient.getSearchResults(query.searchText);
      this.logger.log(`[Search] HTML received, length: ${html?.length || 0}`);
      
      if (!html || html.length === 0) {
        this.logger.warn(`[Search] Empty HTML response for: ${query.searchText}`);
        return paginate([], query.page, query.limit);
      }
      
      // HTML의 일부를 로그로 출력 (디버깅용)
      const htmlPreview = html.substring(0, 500);
      this.logger.log(`[Search] HTML preview: ${htmlPreview}...`);
      
      let results = this.htmlParser.parseSearchResults(html);
      this.logger.log(`[Search] Parsed results count: ${results.length}`);
      
      // 검색 결과에서는 원문 텍스트를 가져오지 않음 (성능 최적화)
      // 원문 텍스트는 상세 페이지에서만 필요하므로, 검색 결과에서는 제외
      // 임시 필드 제거
      results = results.map((result) => {
        const { _originalLinkInfo, ...rest } = result;
        return rest;
      });
      
      if (results.length === 0) {
        this.logger.warn(`[Search] No results found. HTML structure might be different.`);
        // HTML에서 테이블이 있는지 확인
        const $ = cheerio.load(html);
        const tableCount = $('.table_rcp, .table_each_rcp').length;
        this.logger.log(`[Search] Found ${tableCount} tables with .table_rcp or .table_each_rcp classes`);
        
        // 다른 가능한 선택자들도 확인
        const allTables = $('table').length;
        const allDivs = $('div').length;
        this.logger.log(`[Search] Total tables: ${allTables}, Total divs: ${allDivs}`);
      }
      
      return paginate(results, query.page, query.limit);
    } catch (error) {
      this.logger.error(`[Search] Error in search handler: ${error.message}`, error.stack);
      throw error;
    }
  }
}
