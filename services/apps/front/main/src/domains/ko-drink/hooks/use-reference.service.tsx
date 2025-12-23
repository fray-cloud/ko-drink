import { useReferencesQuery, useReferenceQuery } from './query/use-references.query';
import type { PaginationOptions } from '@ko-drink/shared';

export function useReferenceService(options?: PaginationOptions) {
  const referencesQuery = useReferencesQuery(options);

  return {
    references: referencesQuery.data?.data || [],
    meta: referencesQuery.data?.meta,
    isLoading: referencesQuery.isLoading,
    error: referencesQuery.error,
  };
}

export function useReferenceDetailService(referenceId: string) {
  const referenceQuery = useReferenceQuery(referenceId);

  return {
    reference: referenceQuery.data,
    isLoading: referenceQuery.isLoading,
    error: referenceQuery.error,
  };
}

