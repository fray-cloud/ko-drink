import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';

interface LoginData {
  email: string;
  password: string;
}

export function useLoginQuery() {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      return await apiClient.login(data);
    },
  });
}

