import { useNavigate } from 'react-router-dom';
import { KO_DRINK_ROUTES } from '../router';
import type { SearchResult } from '@ko-drink/shared';
import { useMemo } from 'react';
import React from 'react';
import { highlightText, parseDescriptionWithBadges } from '../../common/utils/text.utils';

interface RecipeListItemProps {
  item: SearchResult;
  searchText?: string;
}


// DTO의 모든 필드에서 검색어를 찾는 함수 (표시된 필드 제외)
function findSearchTextInItem(item: SearchResult, searchText: string): string[] {
  if (!searchText) return [];

  const lowerSearchText = searchText.toLowerCase();
  const results: string[] = [];
  
  // 이미 표시된 필드들은 제외하고 나머지 필드에서 찾기
  // 표시된 필드: liquor, book, tags, description
  
  // alias에서 찾기
  if (item.alias && item.alias.toLowerCase().includes(lowerSearchText)) {
    results.push(`별칭: ${item.alias}`);
  }
  
  // liquorHanja에서 찾기
  if (item.liquorHanja && item.liquorHanja.toLowerCase().includes(lowerSearchText)) {
    results.push(`한자명: ${item.liquorHanja}`);
  }
  
  // similarBook에서 찾기
  if (item.similarBook && item.similarBook.toLowerCase().includes(lowerSearchText)) {
    results.push(`유사 문헌: ${item.similarBook}`);
  }
  
  // originalText에서 찾기 (검색어 주변만 표시)
  if (item.originalText && item.originalText.toLowerCase().includes(lowerSearchText)) {
    const index = item.originalText.toLowerCase().indexOf(lowerSearchText);
    const start = Math.max(0, index - 20);
    const end = Math.min(item.originalText.length, index + searchText.length + 20);
    const snippet = item.originalText.substring(start, end);
    results.push(`원문: ...${snippet}...`);
  }
  
  // originalTextTranslation에서 찾기 (검색어 주변만 표시)
  if (item.originalTextTranslation && item.originalTextTranslation.toLowerCase().includes(lowerSearchText)) {
    const index = item.originalTextTranslation.toLowerCase().indexOf(lowerSearchText);
    const start = Math.max(0, index - 20);
    const end = Math.min(item.originalTextTranslation.length, index + searchText.length + 20);
    const snippet = item.originalTextTranslation.substring(start, end);
    results.push(`해석: ...${snippet}...`);
  }
  
  // recipe의 step과 memo에서 찾기
  if (item.recipe && item.recipe.length > 0) {
    item.recipe.forEach((step, stepIndex) => {
      if (step.step && step.step.toLowerCase().includes(lowerSearchText)) {
        const index = step.step.toLowerCase().indexOf(lowerSearchText);
        const start = Math.max(0, index - 20);
        const end = Math.min(step.step.length, index + searchText.length + 20);
        const snippet = step.step.substring(start, end);
        results.push(`레시피 단계 ${stepIndex + 1}: ...${snippet}...`);
      }
      if (step.memo && step.memo.toLowerCase().includes(lowerSearchText)) {
        const index = step.memo.toLowerCase().indexOf(lowerSearchText);
        const start = Math.max(0, index - 20);
        const end = Math.min(step.memo.length, index + searchText.length + 20);
        const snippet = step.memo.substring(start, end);
        results.push(`레시피 메모 ${stepIndex + 1}: ...${snippet}...`);
      }
    });
  }
  
  return results;
}

export function RecipeListItem({ item, searchText }: RecipeListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(
      `${KO_DRINK_ROUTES.DETAIL}?type=recipe&book=${encodeURIComponent(item.book)}&liquor=${encodeURIComponent(item.liquor)}${searchText ? `&q=${encodeURIComponent(searchText)}` : ''}`
    );
  };

  // 표시된 필드들에 검색어가 있는지 확인
  const hasSearchTextInDisplayedFields = useMemo(() => {
    if (!searchText) return false;
    const lowerSearchText = searchText.toLowerCase();
    
    // liquor에서 찾기
    if (item.liquor && item.liquor.toLowerCase().includes(lowerSearchText)) {
      return true;
    }
    
    // book에서 찾기
    if (item.book && item.book.toLowerCase().includes(lowerSearchText)) {
      return true;
    }
    
    // tags에서 찾기
    if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerSearchText))) {
      return true;
    }
    
    // description에서 찾기
    if (item.description && item.description.toLowerCase().includes(lowerSearchText)) {
      return true;
    }
    
    return false;
  }, [searchText, item]);

  // 표시된 필드에 검색어가 없으면 DTO의 다른 필드에서 찾기
  const foundTexts = useMemo(() => {
    if (hasSearchTextInDisplayedFields || !searchText) return [];
    return findSearchTextInItem(item, searchText);
  }, [hasSearchTextInDisplayedFields, searchText, item]);

  return (
    <div
      onClick={handleClick}
      className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      {/* 첫 줄: {술} | {책} */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.liquor}</h3>
        <span className="text-gray-400 dark:text-gray-500">|</span>
        <p className="text-sm text-gray-600 dark:text-gray-400">{item.book}</p>
      </div>
      
      {/* 두 번째 줄: {태그들} */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* 세 번째 줄: {설명} */}
      {item.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {parseDescriptionWithBadges(item.description, searchText)}
        </p>
      )}
      
      {/* 표시된 필드에 검색어가 없고 DTO의 다른 필드에서 찾은 경우 */}
      {!hasSearchTextInDisplayedFields && foundTexts.length > 0 && (
        <div className="mt-2 space-y-1">
          {foundTexts.map((foundText, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
              {highlightText(foundText, searchText || '')}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

