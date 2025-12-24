import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';
import type { SearchResult, RecipeInfo } from '@ko-drink/shared';
import type { PaginationOptions, PaginationMeta } from '@ko-drink/shared';

type SearchType = 'all' | 'book' | 'liq';

interface SearchResponse {
  data: SearchResult[];
  meta: PaginationMeta;
}

// RecipeInfo를 SearchResult로 변환
function convertRecipeToSearchResult(recipe: RecipeInfo): SearchResult {
  return {
    book: recipe.book,
    liquor: recipe.liquor,
    recipe: recipe.recipe,
    liquorHanja: recipe.liquorHanja,
    description: recipe.description,
    tags: recipe.tags,
    alias: recipe.alias,
    similarBook: recipe.similarBook,
    originalText: recipe.originalText,
  };
}

export function useSearchQuery(
  searchText: string,
  options?: PaginationOptions,
  searchType: SearchType = 'all'
) {
  return useQuery<SearchResponse>({
    queryKey: ['search', searchText, options, searchType],
    queryFn: async () => {
      if (searchType === 'all') {
        // 통합 검색: /api/koreansool/search
        return await apiClient.search(searchText, options);
      } else if (searchType === 'book') {
        // 문헌 검색: /api/koreansool/recipes?book=...
        const response = await apiClient.getRecipes({
          book: searchText,
          page: options?.page,
          limit: options?.limit,
        });
        // RecipeListResponseDto를 SearchResponse 형식으로 변환
        return {
          data: (response.data || []).map(convertRecipeToSearchResult),
          meta: response.meta,
        };
      } else if (searchType === 'liq') {
        // 술 검색: /api/koreansool/recipes?liq=...
        const response = await apiClient.getRecipes({
          liq: searchText,
          page: options?.page,
          limit: options?.limit,
        });
        // RecipeListResponseDto를 SearchResponse 형식으로 변환
        return {
          data: (response.data || []).map(convertRecipeToSearchResult),
          meta: response.meta,
        };
      }
      // 기본값: 통합 검색
      return await apiClient.search(searchText, options);
    },
    enabled: !!searchText && searchText.length > 0,
  });
}

