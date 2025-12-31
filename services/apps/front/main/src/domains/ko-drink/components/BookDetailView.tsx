import {
  useBookDetailService,
  useBooksStoreService,
  useBookImageService,
} from '../hooks/use-book.service';
import { parseDescriptionWithBadges } from '../../common/utils/text.utils';

interface BookDetailViewProps {
  bookName: string;
}

export function BookDetailView({ bookName }: BookDetailViewProps) {
  // BooksStore 초기화 (이미 로드된 데이터 활용)
  useBooksStoreService();

  const { book, isLoading, error } = useBookDetailService(bookName);
  const { imageUrl, imageError } = useBookImageService(book?.name);

  // 디버깅: bookName 확인
  const decodedName = decodeURIComponent(bookName);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-700 dark:text-gray-300">
        <div>로딩 중...</div>
        <div className="text-sm mt-2 text-gray-500 dark:text-gray-400">
          검색 중: {decodedName}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <div>오류가 발생했습니다.</div>
        <div className="text-sm mt-2 text-gray-500 dark:text-gray-400">
          문헌명: {decodedName}
        </div>
        {error instanceof Error && (
          <div className="text-xs mt-2 text-gray-400 dark:text-gray-500">
            {error.message}
          </div>
        )}
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-8 text-gray-700 dark:text-gray-300">
        <div>문헌을 찾을 수 없습니다.</div>
        <div className="text-sm mt-2 text-gray-500 dark:text-gray-400">
          검색한 문헌명: {decodedName}
        </div>
        <div className="text-xs mt-2 text-gray-400 dark:text-gray-500">
          (원본: {bookName})
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {book.name}
        </h1>
        {book.nameHanja && (
          <p className="text-xl text-gray-700 dark:text-gray-300 mt-1">
            ({book.nameHanja})
          </p>
        )}
      </div>

      {/* 메타 정보 */}
      <div className="space-y-3">
        {/* 이미지 섹션 - 항상 표시 */}
        {imageUrl && !imageError && (
          <div className="flex gap-6">
            <div className="shrink-0">
              <img
                src={imageUrl}
                alt={book.name}
                className="w-48 h-auto rounded-lg shadow-md object-cover"
                onLoad={() => {
                  console.log('Image loaded successfully:', imageUrl);
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  console.error('Image load error:', {
                    src: target.src,
                    naturalWidth: target.naturalWidth,
                    naturalHeight: target.naturalHeight,
                    complete: target.complete,
                  });
                }}
              />
            </div>
            {/* 텍스트 정보가 있으면 오른쪽에 배치 */}
            {(book.author || book.year || book.description) && (
              <div className="flex-1 space-y-3">
                {book.author && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      저자
                    </h3>
                    <p className="text-gray-800 dark:text-gray-200">
                      {book.author}
                      {book.authorHanja && (
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                          ({book.authorHanja})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {book.year && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      연도
                    </h3>
                    <p className="text-gray-800 dark:text-gray-200">
                      {book.year}
                    </p>
                  </div>
                )}

                {book.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      설명
                    </h3>
                <p className="text-gray-800 dark:text-gray-200">
                  {parseDescriptionWithBadges(book.description, undefined, book.name)}
                </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 텍스트 정보만 있는 경우 */}
        {(!imageUrl || imageError) &&
        (book.author || book.year || book.description) ? (
          <div className="space-y-3">
            {book.author && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  저자
                </h3>
                <p className="text-gray-800 dark:text-gray-200">
                  {book.author}
                  {book.authorHanja && (
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      ({book.authorHanja})
                    </span>
                  )}
                </p>
              </div>
            )}

            {book.year && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  연도
                </h3>
                <p className="text-gray-800 dark:text-gray-200">{book.year}</p>
              </div>
            )}

            {book.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  설명
                </h3>
                <p className="text-gray-800 dark:text-gray-200">
                  {parseDescriptionWithBadges(book.description, undefined, book.name)}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* 링크 섹션 */}
        {(book.originalLink || book.referenceLink || book.recipeLink) && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              관련 링크
            </h3>
            <div className="space-y-2">
              {book.originalLink && (
                <div className="flex items-center gap-2">
                  <a
                    href={book.originalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>원본 링크</span>
                  </a>
                </div>
              )}
              {book.referenceLink && (
                <div className="flex items-center gap-2">
                  <a
                    href={book.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>참조 링크</span>
                  </a>
                </div>
              )}
              {book.recipeLink && (
                <div className="flex items-center gap-2">
                  <a
                    href={book.recipeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span>레시피 링크</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
