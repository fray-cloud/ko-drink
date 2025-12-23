import { useRecipesQuery, useRecipeQuery } from './query/use-recipes.query';

interface RecipeOptions {
  book?: string;
  liq?: string;
  page?: number;
  limit?: number;
}

export function useRecipeService(options?: RecipeOptions) {
  const recipesQuery = useRecipesQuery(options);

  return {
    recipes: recipesQuery.data?.data || [],
    meta: recipesQuery.data?.meta,
    isLoading: recipesQuery.isLoading,
    error: recipesQuery.error,
  };
}

export function useRecipeDetailService(book: string, liquor: string, dup?: number) {
  const recipeQuery = useRecipeQuery(book, liquor, dup);

  // book과 liq를 모두 제공하면 단일 객체를 반환: { book, liquor, dup, recipe }
  // 하나만 제공하면 페이지네이션된 배열을 반환: { data: [...], meta: {...} }
  let recipe = null;
  if (recipeQuery.data) {
    // 단일 객체인 경우 (book과 liq 모두 제공)
    if (recipeQuery.data.book || recipeQuery.data.liquor) {
      recipe = recipeQuery.data;
    }
    // 페이지네이션된 배열인 경우 (book 또는 liq 하나만 제공)
    else if (recipeQuery.data.data && Array.isArray(recipeQuery.data.data)) {
      recipe = recipeQuery.data.data[0] || null;
    }
  }

  return {
    recipe,
    isLoading: recipeQuery.isLoading,
    error: recipeQuery.error,
  };
}

