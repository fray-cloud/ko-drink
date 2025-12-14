import type { SearchResult } from '../../../../common/utils/koreansool-html.parser';

export class GetSearchResponseDto {
  results: SearchResult[];
  count: number;
}
