import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';
import type { User } from '@ko-drink/shared';

export function useCurrentUserQuery() {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await apiClient.getCurrentUser();
    },
    enabled: !!localStorage.getItem('token'),
  });
}

