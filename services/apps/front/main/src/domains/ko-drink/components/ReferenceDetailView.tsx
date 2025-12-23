import { useReferenceDetailService } from '../hooks/use-reference.service';

interface ReferenceDetailViewProps {
  referenceId: string;
}

export function ReferenceDetailView({ referenceId }: ReferenceDetailViewProps) {
  const { reference, isLoading, error } = useReferenceDetailService(referenceId);

  if (isLoading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">오류가 발생했습니다.</div>;
  }

  if (!reference) {
    return <div className="text-center py-8">참조 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {reference.title && <h1 className="text-3xl font-bold">{reference.title}</h1>}
      <div className="space-y-2">
        {reference.category && (
          <p>
            <span className="font-semibold">카테고리:</span> {reference.category}
          </p>
        )}
        {reference.content && (
          <div>
            <span className="font-semibold">내용:</span>
            <p className="mt-1 whitespace-pre-wrap">{reference.content}</p>
          </div>
        )}
        {reference.link && (
          <p>
            <a
              href={reference.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              링크
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

