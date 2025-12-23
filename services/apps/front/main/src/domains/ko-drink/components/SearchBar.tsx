import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { KO_DRINK_ROUTES } from '../router';

interface SearchBarProps {
  initialValue?: string;
}

export function SearchBar({ initialValue = '' }: SearchBarProps) {
  const [searchText, setSearchText] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`${KO_DRINK_ROUTES.RESULTS}?q=${encodeURIComponent(searchText.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
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

