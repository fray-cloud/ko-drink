import { create } from 'zustand';
import type { Book } from '@ko-drink/shared';

interface BooksState {
  books: Book[];
  isLoading: boolean;
  isLoaded: boolean;
  setBooks: (books: Book[]) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useBooksStore = create<BooksState>((set) => ({
  books: [],
  isLoading: false,
  isLoaded: false,
  setBooks: (books) => set({ books, isLoaded: true }),
  setLoading: (isLoading) => set({ isLoading }),
}));

