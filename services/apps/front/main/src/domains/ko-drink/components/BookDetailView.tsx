import { useBookDetailService } from '../hooks/use-book.service';

interface BookDetailViewProps {
  bookName: string;
}

export function BookDetailView({ bookName }: BookDetailViewProps) {
  const { book, isLoading, error } = useBookDetailService(bookName);

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">오류가 발생했습니다.</div>;
  }

  if (!book) {
    return <div className="text-center py-8">문헌을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{book.name}</h1>
        {book.nameHanja && <p className="text-lg text-gray-600">{book.nameHanja}</p>}
      </div>
      <div className="space-y-2">
        {book.author && (
          <p>
            <span className="font-semibold">저자:</span> {book.author}
          </p>
        )}
        {book.year && (
          <p>
            <span className="font-semibold">연도:</span> {book.year}
          </p>
        )}
        {book.description && (
          <div>
            <span className="font-semibold">설명:</span>
            <p className="mt-1">{book.description}</p>
          </div>
        )}
        {book.originalLink && (
          <p>
            <a
              href={book.originalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              원본 링크
            </a>
          </p>
        )}
        {book.referenceLink && (
          <p>
            <a
              href={book.referenceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              참조 링크
            </a>
          </p>
        )}
        {book.recipeLink && (
          <p>
            <a
              href={book.recipeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              레시피 링크
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

