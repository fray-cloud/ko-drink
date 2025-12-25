import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { SearchResultsList } from '../components/SearchResultsList';

export function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <SearchBar initialValue={query} />
        </div>
        {query && <SearchResultsList searchText={query} />}
        {!query && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">검색어를 입력하세요.</div>
        )}
      </div>
    </div>
  );
}

