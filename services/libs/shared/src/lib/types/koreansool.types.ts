export interface DetailRecipeLink {
  href: string;
  params: {
    book: string;
    liquor: string;
    dup?: number;
  };
}

export interface SearchResult {
  book: string;
  liquor: string;
  recipe: RecipeStep[];
  // 메타 정보
  liquorHanja?: string; // 술 이름 한자 (예: 甘香酒)
  description?: string; // 설명 (예: "달고 향기로운 술")
  tags?: string[]; // 분류 태그 (예: ["발효주", "순곡주", "단양주", "느림", "유사"])
  alias?: string; // 별칭 (예: "이화주")
  similarBook?: string; // 유사 문헌 (예: "잡초")
  originalText?: string; // 원문 텍스트
  originalTextTranslation?: string; // 원문 해석
  detailRecipe?: DetailRecipeLink; // 상세 주방문 링크
}

export interface RecipeInfo {
  book: string;
  liquor: string;
  dup: number;
  recipe: RecipeStep[];
  // 메타 정보
  liquorHanja?: string; // 술 이름 한자 (예: 甘香酒)
  description?: string; // 설명 (예: "달고 향기로운 술")
  tags?: string[]; // 분류 태그 (예: ["발효주", "순곡주", "단양주", "느림", "유사"])
  alias?: string; // 별칭 (예: "이화주")
  similarBook?: string; // 유사 문헌 (예: "잡초")
  originalText?: string; // 원문 텍스트
  originalTextTranslation?: string; // 원문 해석
  detailRecipe?: DetailRecipeLink; // 상세 주방문 링크
}

export interface RecipeMaterial {
  materialName: string;
  value: string;
}

export interface RecipeStep {
  step?: string;
  day: number;
  materials?: RecipeMaterial[];
  memo?: string;
}

export interface Book {
  name: string;
  nameHanja?: string;
  author?: string;
  authorHanja?: string;
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

