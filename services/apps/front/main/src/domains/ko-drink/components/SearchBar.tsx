import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KO_DRINK_ROUTES } from '../router';

type SearchType = 'all' | 'book' | 'liq';

interface SearchBarProps {
  initialValue?: string;
}

export function SearchBar({ initialValue = '' }: SearchBarProps) {
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(initialValue);
  const urlType = (searchParams.get('type') as SearchType) || 'all';
  const [searchType, setSearchType] = useState<SearchType>(urlType);
  const navigate = useNavigate();

  // URL의 type 파라미터가 변경되면 동기화
  useEffect(() => {
    const currentUrlType = (searchParams.get('type') as SearchType) || 'all';
    setSearchType(currentUrlType);
  }, [searchParams]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      const query = encodeURIComponent(searchText.trim());
      if (searchType === 'all') {
        navigate(`${KO_DRINK_ROUTES.RESULTS}?q=${query}&type=${searchType}`);
      } else if (searchType === 'book') {
        navigate(`${KO_DRINK_ROUTES.RESULTS}?q=${query}&type=${searchType}`);
      } else if (searchType === 'liq') {
        navigate(`${KO_DRINK_ROUTES.RESULTS}?q=${query}&type=${searchType}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as SearchType)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">통합</option>
          <option value="book">문헌</option>
          <option value="liq">술</option>
        </select>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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

