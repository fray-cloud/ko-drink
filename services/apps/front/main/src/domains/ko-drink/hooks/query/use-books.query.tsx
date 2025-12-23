import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';
import type { PaginationOptions } from '@ko-drink/shared';
import type { Book } from '@ko-drink/shared';

interface BooksResponse {
  data: Book[];
  meta?: any;
}

export function useBooksQuery(options?: PaginationOptions) {
  return useQuery<BooksResponse>({
    queryKey: ['books', options],
    queryFn: async () => {
      return await apiClient.getBooks(options);
    },
  });
}

export function useBookQuery(bookName: string) {
  return useQuery<Book | null>({
    queryKey: ['book', bookName],
    queryFn: async () => {
      const response = await apiClient.getBooks();
      return response.data.find((book: Book) => book.name === bookName) || null;
    },
    enabled: !!bookName,
  });
}

