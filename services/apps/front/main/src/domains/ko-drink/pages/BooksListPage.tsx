import { useBookService, useBooksStoreService } from '../hooks/use-book.service';
import { BookListItem } from '../components/BookListItem';
import { useMemo } from 'react';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

export function BooksListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // BooksStore 초기화 (다른 페이지에서도 사용할 수 있도록)
  useBooksStoreService();

  // URL 쿼리 파라미터에서 page와 limit 읽기
  const page = useMemo(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const limitParam = searchParams.get('limit');
    return limitParam ? parseInt(limitParam, 10) : 20;
  }, [searchParams]);

  const { books, meta, isLoading, error } = useBookService({ page, limit });

  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return meta?.totalPages || 1;
  }, [meta]);

  // limit 변경 핸들러
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8 text-gray-700 dark:text-gray-300">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8 text-red-500 dark:text-red-400">오류가 발생했습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">문헌 목록</h1>

        {books.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">문헌이 없습니다.</div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {books.map((book, index) => (
                <BookListItem key={`${book.name}-${index}`} book={book} />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* 페이지 정보 */}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {meta?.totalItems ? (
                    <>
                      전체 {meta.totalItems}개 중 {((page - 1) * limit) + 1}-
                      {Math.min(page * limit, meta.totalItems)}개 표시
                    </>
                  ) : (
                    `${books.length}개 표시`
                  )}
                </div>

                {/* 페이지 번호 버튼 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // 현재 페이지 주변 2페이지씩만 표시
                      return p === 1 || p === totalPages || Math.abs(p - page) <= 2;
                    })
                    .map((p, idx, arr) => {
                      // 첫 페이지와 마지막 페이지 사이에 생략 표시
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;

                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              p === page
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>

                {/* 페이지당 항목 수 선택 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">페이지당:</label>
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

