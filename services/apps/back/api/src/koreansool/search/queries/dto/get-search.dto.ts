import type { SearchResult } from '@ko-drink/shared';

export class GetSearchResponseDto {
  results: SearchResult[];
  count: number;
}
