import { SearchBar } from '../components/SearchBar';

export function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">한국 전통주 검색</h1>
          <p className="text-gray-600">문헌, 레시피, 참조 정보를 검색하세요</p>
        </div>
        <SearchBar />
      </div>
    </div>
  );
}

