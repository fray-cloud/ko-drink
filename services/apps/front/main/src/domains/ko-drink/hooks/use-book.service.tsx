import { useEffect, useMemo } from 'react';
import { useBooksQuery, useBookQuery } from './query/use-books.query';
import { useBooksStore } from './store/use-books.store';
import type { PaginationOptions } from '@ko-drink/shared';
import type { Book } from '@ko-drink/shared';

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
  const { books, isLoaded } = useBooksStore();
  const bookQuery = useBookQuery(bookName);

  // 스토어에 데이터가 있으면 먼저 스토어에서 찾기
  const bookFromStore = useMemo(() => {
    if (!bookName || !isLoaded || books.length === 0) return null;
    
    const decodedName = decodeURIComponent(bookName);
    return books.find((book: Book) => {
      if (!book || !book.name) return false;
      return book.name === decodedName || book.name === bookName || book.name.trim() === decodedName.trim();
    }) || null;
  }, [bookName, books, isLoaded]);

  // 스토어에 있으면 스토어 데이터 사용, 없으면 쿼리 결과 사용
  const book = bookFromStore || bookQuery.data;
  const isLoading = !isLoaded && bookQuery.isLoading;
  const error = bookQuery.error;

  return {
    book,
    isLoading,
    error,
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

