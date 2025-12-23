import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';
import type { PaginationOptions } from '@ko-drink/shared';
import type { Reference } from '@ko-drink/shared';

interface ReferencesResponse {
  data: Reference[];
  meta?: any;
}

export function useReferencesQuery(options?: PaginationOptions) {
  return useQuery<ReferencesResponse>({
    queryKey: ['references', options],
    queryFn: async () => {
      return await apiClient.getReferences(options);
    },
  });
}

export function useReferenceQuery(referenceId: string) {
  return useQuery<Reference | null>({
    queryKey: ['reference', referenceId],
    queryFn: async () => {
      const response = await apiClient.getReferences();
      return response.data.find((ref: Reference) => ref.id === referenceId) || null;
    },
    enabled: !!referenceId,
  });
}

