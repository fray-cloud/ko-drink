import { useEffect } from 'react';
import { useBooksQuery, useBookQuery } from './query/use-books.query';
import { useBooksStore } from './store/use-books.store';
import type { PaginationOptions } from '@ko-drink/shared';

export function useBookService(options?: PaginationOptions) {
  const booksQuery = useBooksQuery(options);

  return {
    books: booksQuery.data?.data || [],
    meta: booksQuery.data?.meta,
    isLoading: booksQuery.isLoading,
    error: booksQuery.error,
  };
}

export function useBookDetailService(bookName: string) {
  const bookQuery = useBookQuery(bookName);

  return {
    book: bookQuery.data,
    isLoading: bookQuery.isLoading,
    error: bookQuery.error,
  };
}

/**
 * 문헌 목록을 전역 스토어에 로드하는 서비스
 * 한 번만 로드하고 스토어에 저장하여 재사용
 */
export function useBooksStoreService() {
  const { books, isLoaded, setBooks, setLoading } = useBooksStore();
  const { data: booksData, isLoading: booksLoading } = useBooksQuery(
    !isLoaded ? { page: 1, limit: 200 } : undefined
  );

  // 문헌 목록을 스토어에 저장
  useEffect(() => {
    if (booksData?.data && !isLoaded) {
      setBooks(booksData.data);
      setLoading(false);
    }
  }, [booksData, isLoaded, setBooks, setLoading]);

  // 로딩 상태 동기화
  useEffect(() => {
    if (booksLoading) {
      setLoading(true);
    }
  }, [booksLoading, setLoading]);

  return {
    books,
    isLoading: booksLoading || !isLoaded,
    isLoaded,
  };
}

