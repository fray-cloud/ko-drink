import { useBooksQuery, useBookQuery } from './query/use-books.query';
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

