export interface SearchResult {
  book: string;
  liquor: string;
  recipe: RecipeStep[];
}

export interface RecipeInfo {
  book: string;
  liquor: string;
  dup: number;
  recipe: RecipeStep[];
}

export interface RecipeMaterial {
  materialName: string;
  value: string;
}

export interface RecipeStep {
  step: string;
  day: number;
  materials: RecipeMaterial[];
  memo?: string;
}

export interface Book {
  name: string;
  nameHanja?: string;
  author?: string;
  year?: number;
  description?: string;
  originalLink?: string;
  referenceLink?: string;
  recipeLink?: string;
}

export interface Reference {
  id?: string;
  title?: string;
  content?: string;
  category?: string;
  link?: string;
}

