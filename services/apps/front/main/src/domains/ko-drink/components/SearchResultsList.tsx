import { useSearchService } from '../hooks/use-search.service';
import { RecipeListItem } from './RecipeListItem';
import { ResultTabs } from './ResultTabs';
import { useState } from 'react';
import type { SearchResult } from '@ko-drink/shared';

type TabType = 'all' | 'books' | 'recipes';

export function SearchResultsList({ searchText }: { searchText: string }) {
  const { searchResults, isSearching, count } = useSearchService(searchText);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  if (isSearching) {
    return <div className="text-center py-8">검색 중...</div>;
  }

  if (searchResults.length === 0) {
    return <div className="text-center py-8">검색 결과가 없습니다.</div>;
  }

  // 탭별 필터링 (실제로는 검색 결과에 타입 정보가 있어야 함)
  // 여기서는 간단하게 모든 결과를 레시피로 표시
  const filteredResults = searchResults;

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-600">총 {count}개의 결과</p>
      </div>
      <ResultTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mt-4">
        {activeTab === 'all' || activeTab === 'recipes' ? (
          <div>
            {filteredResults.map((result: SearchResult, index: number) => (
              <RecipeListItem key={index} item={result} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">문헌 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

