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
      className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{book.name}</h3>
          {book.nameHanja && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{book.nameHanja}</p>
          )}
          <div className="mt-2 space-y-1">
            {book.author && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">저자:</span> {book.author}
                {book.authorHanja && (
                  <span className="ml-1">({book.authorHanja})</span>
                )}
              </p>
            )}
            {book.year && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">연도:</span> {book.year}
              </p>
            )}
          </div>
          {book.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
              {book.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

