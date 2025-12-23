import { useRecipeDetailService } from '../hooks/use-recipe.service';
import type { RecipeStep } from '@ko-drink/shared';

interface RecipeDetailViewProps {
  book: string;
  liquor: string;
  dup?: number;
}

export function RecipeDetailView({ book, liquor, dup }: RecipeDetailViewProps) {
  const { recipe, isLoading, error } = useRecipeDetailService(book, liquor, dup);

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">오류가 발생했습니다.</div>;
  }

  if (!recipe) {
    return <div className="text-center py-8">레시피를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{recipe.liquor}</h1>
        {recipe.liquorHanja && (
          <p className="text-xl text-gray-700 mt-1">({recipe.liquorHanja})</p>
        )}
      </div>

      {/* 메타 정보 */}
      <div className="space-y-3">
        {recipe.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">설명</h3>
            <p className="text-gray-800">{recipe.description}</p>
          </div>
        )}

        {recipe.tags && recipe.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">분류</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {recipe.alias && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">별칭</h3>
            <p className="text-gray-800">{recipe.alias}</p>
          </div>
        )}

        {recipe.similarBook && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">유사 문헌</h3>
            <p className="text-gray-800">《{recipe.similarBook}》</p>
          </div>
        )}
      </div>

      {/* 레시피 */}
      {recipe.recipe && recipe.recipe.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">레시피</h2>
          {recipe.recipe.map((step: RecipeStep, index: number) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-lg">{step.step || `단계 ${index + 1}`}</span>
                {step.day && step.day > 0 && (
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                    {step.day}일
                  </span>
                )}
              </div>
              {step.materials && step.materials.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-2 text-gray-700">재료</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {step.materials.map((material, matIndex) => (
                      <div
                        key={matIndex}
                        className="bg-white p-2 rounded border border-gray-200"
                      >
                        <span className="font-medium text-gray-800">{material.materialName}</span>
                        {material.value && (
                          <span className="text-gray-600 ml-2">: {material.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {step.memo && (
                <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">메모</p>
                  <p className="text-sm text-yellow-900 whitespace-pre-wrap">{step.memo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 원문 텍스트 */}
      {recipe.originalText && (
        <div className="space-y-2 border-t pt-4">
          <h2 className="text-2xl font-semibold">원문</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p 
              className="original-text text-gray-800 whitespace-pre-wrap leading-relaxed"
              style={{ 
                fontFamily: '"함초롬바탕", "HANBatang", "Noto Serif KR", serif',
                fontSize: '1.1rem',
                lineHeight: '1.8',
                backgroundColor: '#efefe5',
              }}
            >
              {recipe.originalText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

