import { useNavigate } from 'react-router-dom';
import { KO_DRINK_ROUTES } from '../router';
import type { Book } from '@ko-drink/shared';

interface BookListItemProps {
  book: Book;
}

export function BookListItem({ book }: BookListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(
      `${KO_DRINK_ROUTES.DETAIL}?type=book&name=${encodeURIComponent(book.name)}`
    );
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
    >
      <h3 className="text-lg font-semibold">{book.name}</h3>
      {book.nameHanja && <p className="text-sm text-gray-600">{book.nameHanja}</p>}
      {book.author && <p className="text-sm text-gray-500">저자: {book.author}</p>}
      {book.year && <p className="text-sm text-gray-500">연도: {book.year}</p>}
      {book.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{book.description}</p>
      )}
    </div>
  );
}

