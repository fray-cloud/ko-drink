import { useRecipeDetailService } from '../hooks/use-recipe.service';
import { useThemeStore } from '../../common/hooks/store/use-theme.store';
import type { RecipeStep } from '@ko-drink/shared';
import { useMemo } from 'react';
import React from 'react';
import { highlightText, parseDescriptionWithBadges } from '../../common/utils/text.utils';

interface RecipeDetailViewProps {
  book: string;
  liquor: string;
  dup?: number;
  searchText?: string;
}


// 재료 설명 맵
const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  발효: '발효시키는 날짜. 누룩을 물에 담그는 일수는 제외',
  멥쌀: '빚을 때 들어간 멥쌀의 양',
  찹쌀: '빚을 때 들어간 찹쌀의 양',
  침미: '쌀을 씻은 후 물에 담그고 밤을 지새우는 날짜. 1이면 하룻밤, 3이면 3일 밤 물에 담그는 것을 말함',
  물: '빚을 때 들어간 물의 양. 단위는 되, 말, 사발, 동이 등 다양',
  장수: '곡물을 오래 담가서 시어진 물',
  탕혼: '백설기, 고두밥 등에 뜨거운 물을 섞는 것',
  냉혼: '고두밥에 찬물을 섞거나 씻는 것',
  가공: '주원료인 곡물을 처리하는 방식',
  살수: '고두밥을 찔 때 물을 뿌려가며 다시 찌는 것',
  침숙: '쌀을 가공하여 죽, 고두밥 등을 만든 후 밤을 지새우는 날짜. 1이면 하룻밤, 3이면 3일 밤을 지내는 것을 말함',
  누룩: '빚을 때 들어간 누룩의 양. 주방문 원문 표기에 누룩의 단위가 홉, 되, 말이 아닌 근(斤), 냥(兩)으로 기록된 경우 메모의 부재료에 표기',
  누룩형태: '누룩의 종류나 분쇄도',
  침국: '누룩을 물에 담가두는 날짜. 0이면 당일 몇 시간 동안, 1이면 하룻밤, 3이면 3일 밤 물에 담그는 것을 말함',
  녹국: '물에 담근 누룩을 걸러 물만 쓰는 것',
  밀분: '밀가루의 양',
  석임: '효모를 증식시킨 양조 스타터의 양. 배양된 효모와 젖산에 의해 밑술의 초반 발효를 돕는 역할을 하며 서김, 석김(錫金), 석임, 부본(腐本), 주본(酒本), 본(本), 주모(酒母), 주효(酒酵), 효(酵) 등으로 기록되어 있음',
  여과: '이전 단계의 술을 베 보자기 등으로 거르는 것',
  가주: '발효 초반 또는 후반에 발효주나 증류주를 섞는 것',
  온혼: '고두밥 등이 아직 식지 않았을 때 누룩과 혼합하는 것',
  보쌈: '항아리를 두꺼운 이불이나 거적 등으로 덮는 것',
  밀봉: '항아리를 밀봉하는 것',
};

// 가공 방법 정보 맵 (분류 > 명칭: 설명)
const PROCESSING_METHODS: Record<string, { category: string; description: string }> = {
  // 밥류
  고두밥: { category: '밥류', description: '알곡+찌기' },
  밥: { category: '밥류', description: '알곡+삶기' },
  // 죽류
  범벅: { category: '죽류', description: '가루+뜨거운 물 붓기' },
  풀: { category: '죽류', description: '가루+물에 되게 끓이기' },
  죽: { category: '죽류', description: '가루+물에 끓이기' },
  알곡죽: { category: '죽류', description: '알곡+물에 끓이기' },
  응이: { category: '죽류', description: '가루+물에 묽게 끓이기' },
  미음: { category: '죽류', description: '가루+물에 묽게 끓이기' },
  // 떡류
  백설기: { category: '떡류', description: '가루+찌기' },
  찌는떡: { category: '떡류', description: '가루+익반죽+찌기' },
  구멍떡: { category: '떡류', description: '가루+익반죽(구멍떡)+삶기' },
  삶는떡: { category: '떡류', description: '가루+익반죽(기타)+삶기' },
  인절미: { category: '떡류', description: '알곡+찌기+치기' },
};

export function RecipeDetailView({ book, liquor, dup, searchText }: RecipeDetailViewProps) {
  const { recipe, isLoading, error } = useRecipeDetailService(book, liquor, dup);
  const { getEffectiveTheme } = useThemeStore();
  const isDark = getEffectiveTheme() === 'dark';

  if (isLoading) {
    return <div className="text-center py-8 text-gray-700 dark:text-gray-300">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500 dark:text-red-400">오류가 발생했습니다.</div>;
  }

  if (!recipe) {
    return <div className="text-center py-8 text-gray-700 dark:text-gray-300">레시피를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{recipe.liquor}</h1>
        {recipe.liquorHanja && (
          <p className="text-xl text-gray-700 dark:text-gray-300 mt-1">({recipe.liquorHanja})</p>
        )}
      </div>

      {/* 메타 정보 */}
      <div className="space-y-3">
        {recipe.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">설명</h3>
            <p className="text-gray-800 dark:text-gray-200">
              {parseDescriptionWithBadges(recipe.description, searchText)}
            </p>
          </div>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">분류</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {recipe.alias && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">별칭</h3>
            <p className="text-gray-800 dark:text-gray-200">{recipe.alias}</p>
          </div>
        )}

        {recipe.similarBook && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">유사 문헌</h3>
            <p className="text-gray-800 dark:text-gray-200">《{recipe.similarBook}》</p>
          </div>
        )}
      </div>

      {/* 레시피 */}
      {recipe.recipe && recipe.recipe.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">레시피</h2>
          {recipe.recipe.map((step: RecipeStep, index: number) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-r">
              <div className="flex items-center gap-2 mb-2">
                {step.step && (
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    {searchText ? highlightText(step.step || '(빈값)', searchText) : (step.step || '(빈값)')}
                  </span>
                )}
                {step.day !== undefined && step.day !== null && Number(step.day) > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                    {step.day}일차
                  </span>
                )}
              </div>
              {step.materials && step.materials.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">재료</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {step.materials.map((material, matIndex) => {
                      const description = MATERIAL_DESCRIPTIONS[material.materialName];
                      return (
                        <div
                          key={matIndex}
                          className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 flex flex-col"
                        >
                          <div className="flex items-center gap-2">
                            {description ? (
                              <div className="group relative inline-block">
                                <span className="font-medium text-gray-800 dark:text-gray-200 cursor-help underline decoration-dotted decoration-gray-400 dark:decoration-gray-500 hover:decoration-gray-600 dark:hover:decoration-gray-400">
                                  {material.materialName}
                                </span>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                                  <div className="font-semibold mb-1.5 text-sm">{material.materialName}</div>
                                  <div className="text-gray-300 dark:text-gray-400 whitespace-normal leading-relaxed">
                                    {description}
                                  </div>
                                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                </div>
                              </div>
                            ) : (
                              <span className="font-medium text-gray-800 dark:text-gray-200">{material.materialName}</span>
                            )}
                          </div>
                          {material.value && (
                            <div className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                              {material.materialName === '가공' && PROCESSING_METHODS[material.value] ? (
                                <div className="group relative inline-block">
                                  <span className="cursor-help">
                                    {PROCESSING_METHODS[material.value].category} &gt; {material.value}
                                  </span>
                                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-72 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl border border-gray-700">
                                    <div className="font-semibold mb-1.5 text-sm">{material.value}</div>
                                    <div className="text-gray-300 dark:text-gray-400 whitespace-normal leading-relaxed">
                                      {PROCESSING_METHODS[material.value].description}
                                    </div>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                                  </div>
                                </div>
                              ) : (
                                material.value
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {step.memo && (
                <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-3 rounded">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">메모</p>
                  <p className="text-sm text-yellow-900 dark:text-yellow-100 whitespace-pre-wrap">
                    {searchText ? highlightText(step.memo, searchText) : step.memo}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 원문 텍스트 */}
      {(recipe.originalText || recipe.originalTextTranslation) && (
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">원문</h2>
          {recipe.originalText && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <p 
                className="original-text text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed"
                style={{ 
                  fontFamily: '"함초롬바탕", "HANBatang", "Noto Serif KR", serif',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  backgroundColor: isDark ? '#2d2d2d' : '#efefe5',
                }}
              >
                {searchText ? highlightText(recipe.originalText, searchText) : recipe.originalText}
              </p>
            </div>
          )}
          {recipe.originalTextTranslation && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">해석</h3>
              <p 
                className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed"
                style={{ 
                  fontSize: '1rem',
                  lineHeight: '1.8',
                }}
              >
                {searchText ? highlightText(recipe.originalTextTranslation, searchText) : recipe.originalTextTranslation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

