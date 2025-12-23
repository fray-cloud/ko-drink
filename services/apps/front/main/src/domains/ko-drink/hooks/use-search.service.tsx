import { useSearchQuery } from './query/use-search.query';
import { useSearchStore } from './store/use-search.store';
import type { PaginationOptions } from '@ko-drink/shared';

export function useSearchService(searchText?: string, options?: PaginationOptions) {
  const { searchText: storeSearchText, setSearchText } = useSearchStore();
  const queryText = searchText ?? storeSearchText;
  const searchQuery = useSearchQuery(queryText, options);

  const search = (text: string) => {
    setSearchText(text);
  };

  return {
    search,
    searchResults: searchQuery.data?.data || [],
    count: searchQuery.data?.meta?.total || 0,
    isSearching: searchQuery.isLoading,
    error: searchQuery.error,
  };
}

