import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';
import type { SearchResult } from '@ko-drink/shared';
import type { PaginationOptions, PaginationMeta } from '@ko-drink/shared';

interface SearchResponse {
  data: SearchResult[];
  meta: PaginationMeta;
}

export function useSearchQuery(searchText: string, options?: PaginationOptions) {
  return useQuery<SearchResponse>({
    queryKey: ['search', searchText, options],
    queryFn: async () => {
      return await apiClient.search(searchText, options);
    },
    enabled: !!searchText && searchText.length > 0,
  });
}

