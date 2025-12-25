import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KO_DRINK_ROUTES } from '../router';
import { useBooksStoreService } from '../hooks/use-book.service';

type SearchType = 'all' | 'book' | 'liq';

interface SearchBarProps {
  initialValue?: string;
}

export function SearchBar({ initialValue = '' }: SearchBarProps) {
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(initialValue);
  const urlType = (searchParams.get('type') as SearchType) || 'all';
  const [searchType, setSearchType] = useState<SearchType>(urlType);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { books } = useBooksStoreService();

  // URL의 type 파라미터가 변경되면 동기화
  useEffect(() => {
    const currentUrlType = (searchParams.get('type') as SearchType) || 'all';
    setSearchType(currentUrlType);
  }, [searchParams]);

  // 필터링된 문헌 목록
  const filteredBooks = searchType === 'book' && searchText.trim()
    ? books.filter((book) =>
        book.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      const query = encodeURIComponent(searchText.trim());
      navigate(`${KO_DRINK_ROUTES.RESULTS}?q=${query}&type=${searchType}`);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setShowSuggestions(searchType === 'book' && e.target.value.trim().length > 0);
    setSelectedIndex(-1);
  };

  const handleBookSelect = (bookName: string) => {
    setSearchText(bookName);
    setShowSuggestions(false);
    const query = encodeURIComponent(bookName);
    navigate(`${KO_DRINK_ROUTES.RESULTS}?q=${query}&type=${searchType}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchType !== 'book' || !showSuggestions || filteredBooks.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredBooks.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleBookSelect(filteredBooks[selectedIndex].name);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleFocus = () => {
    if (searchType === 'book' && searchText.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // suggestions 클릭 시 blur 이벤트가 먼저 발생하므로 약간의 지연을 둠
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 200);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 relative">
        <select
          value={searchType}
          onChange={(e) => {
            setSearchType(e.target.value as SearchType);
            setShowSuggestions(false);
            setSelectedIndex(-1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">통합</option>
          <option value="book">문헌</option>
          <option value="liq">술</option>
        </select>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="검색어를 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSuggestions && filteredBooks.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {filteredBooks.map((book, index) => (
                <button
                  key={book.name}
                  type="button"
                  onClick={() => handleBookSelect(book.name)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium">{book.name}</div>
                  {book.nameHanja && (
                    <div className="text-sm text-gray-500">{book.nameHanja}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          검색
        </button>
      </div>
    </form>
  );
}

