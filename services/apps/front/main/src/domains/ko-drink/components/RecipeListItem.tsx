import { useNavigate } from 'react-router-dom';
import { KO_DRINK_ROUTES } from '../router';
import type { SearchResult } from '@ko-drink/shared';

interface RecipeListItemProps {
  item: SearchResult;
}

export function RecipeListItem({ item }: RecipeListItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(
      `${KO_DRINK_ROUTES.DETAIL}?type=recipe&book=${encodeURIComponent(item.book)}&liquor=${encodeURIComponent(item.liquor)}`
    );
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.liquor}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{item.book}</p>
      {item.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.description}</p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

