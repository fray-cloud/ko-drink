import { useSearchService } from '../hooks/use-search.service';
import { RecipeListItem } from './RecipeListItem';
import { useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchResult } from '@ko-drink/shared';

type SearchType = 'all' | 'book' | 'liq';

export function SearchResultsList({ searchText }: { searchText: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchType = (searchParams.get('type') as SearchType) || 'all';
  
  // URL 쿼리 파라미터에서 page와 limit 읽기
  const page = useMemo(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const limitParam = searchParams.get('limit');
    return limitParam ? parseInt(limitParam, 10) : 10;
  }, [searchParams]);

  const { searchResults, isSearching, count } = useSearchService(
    searchText,
    { page, limit },
    searchType
  );

  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return Math.ceil(count / limit);
  }, [count, limit]);

  // limit 변경 시 첫 페이지로 이동
  const handleLimitChange = (newLimit: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('limit', newLimit.toString());
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams, { replace: true });
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', newPage.toString());
      setSearchParams(newSearchParams, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 이전 검색어를 추적하여 실제로 변경되었을 때만 첫 페이지로 이동
  const prevSearchTextRef = useRef<string | undefined>(undefined);
  
  useEffect(() => {
    if (!searchText) {
      prevSearchTextRef.current = searchText;
      return;
    }
    
    // 검색어가 실제로 변경되었을 때만 첫 페이지로 리셋
    if (prevSearchTextRef.current !== undefined && prevSearchTextRef.current !== searchText) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', '1');
        // limit는 유지 (변경하지 않음)
        return newParams;
      }, { replace: true });
    }
    
    prevSearchTextRef.current = searchText;
  }, [searchText, setSearchParams]);

  if (isSearching) {
    return <div className="text-center py-8">검색 중...</div>;
  }

  if (searchResults.length === 0) {
    return <div className="text-center py-8">검색 결과가 없습니다.</div>;
  }

  const filteredResults = searchResults;

  // 페이지네이션 버튼 생성
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하인 경우 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 첫 페이지
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // 현재 페이지 주변
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // 마지막 페이지
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">총 {count}개의 결과</p>
        <div className="flex items-center gap-2">
          <label htmlFor="limit-select" className="text-sm text-gray-600">
            페이지당:
          </label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10개</option>
            <option value={20}>20개</option>
            <option value={50}>50개</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <div>
          {filteredResults.map((result: SearchResult, index: number) => (
            <RecipeListItem key={index} item={result} />
          ))}
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            이전
          </button>

          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }

            const pageNumber = pageNum as number;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  page === pageNumber
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

