import { useSearchParams } from 'react-router-dom';
import { RecipeDetailView } from '../components/RecipeDetailView';
import { BookDetailView } from '../components/BookDetailView';
import { ReferenceDetailView } from '../components/ReferenceDetailView';

export function DetailPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const book = searchParams.get('book');
  const liquor = searchParams.get('liquor');
  const dup = searchParams.get('dup');
  const name = searchParams.get('name');
  const referenceId = searchParams.get('id');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {type === 'recipe' && book && liquor && (
          <RecipeDetailView
            book={book}
            liquor={liquor}
            dup={dup ? parseInt(dup, 10) : undefined}
          />
        )}
        {type === 'book' && name && <BookDetailView bookName={name} />}
        {type === 'reference' && referenceId && (
          <ReferenceDetailView referenceId={referenceId} />
        )}
        {!type && (
          <div className="text-center py-8 text-gray-500">
            잘못된 요청입니다. 타입을 지정해주세요.
          </div>
        )}
      </div>
    </div>
  );
}

