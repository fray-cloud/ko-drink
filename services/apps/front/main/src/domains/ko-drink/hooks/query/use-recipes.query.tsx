import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';

interface RecipeOptions {
  book?: string;
  liq?: string;
  page?: number;
  limit?: number;
}

interface RecipeResponse {
  data: any[];
  meta?: any;
}

export function useRecipesQuery(options?: RecipeOptions) {
  return useQuery<RecipeResponse>({
    queryKey: ['recipes', options],
    queryFn: async () => {
      return await apiClient.getRecipes(options);
    },
  });
}

export function useRecipeQuery(book: string, liquor: string, dup?: number) {
  return useQuery({
    queryKey: ['recipe', book, liquor, dup],
    queryFn: async () => {
      return await apiClient.getRecipes({ book, liq: liquor, dup });
    },
    enabled: !!book && !!liquor,
  });
}

