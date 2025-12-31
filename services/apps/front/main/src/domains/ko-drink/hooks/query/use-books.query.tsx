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
      if (!bookName) return null;
      
      // 모든 책을 가져오기 위해 큰 limit 설정
      const response = await apiClient.getBooks({ page: 1, limit: 1000 });
      
      // 응답 구조 확인: response.data가 배열인지, response.data.data가 배열인지
      let books: Book[] = [];
      if (Array.isArray(response.data)) {
        books = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        books = response.data.data;
      } else if (Array.isArray(response)) {
        books = response;
      }
      
      // 디코딩된 bookName과 정확히 일치하는 책 찾기
      const decodedBookName = decodeURIComponent(bookName);
      
      // 여러 방법으로 매칭 시도
      const foundBook = books.find((book: Book) => {
        if (!book || !book.name) return false;
        // 정확한 매칭
        if (book.name === decodedBookName || book.name === bookName) {
          return true;
        }
        // 공백 제거 후 매칭
        const normalizedBookName = book.name.trim();
        const normalizedSearchName = decodedBookName.trim();
        if (normalizedBookName === normalizedSearchName) {
          return true;
        }
        return false;
      });
      
      return foundBook || null;
    },
    enabled: !!bookName,
  });
}

export function useBookImageQuery(bookName: string) {
  return useQuery<Blob>({
    queryKey: ['bookImage', bookName],
    queryFn: async () => {
      if (!bookName) throw new Error('Book name is required');
      return await apiClient.getBookImage(bookName);
    },
    enabled: !!bookName,
    staleTime: Infinity, // 이미지는 변경되지 않으므로 캐시 유지
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });
}

