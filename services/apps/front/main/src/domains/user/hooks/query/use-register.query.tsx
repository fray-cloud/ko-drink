import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../../../common/api-client';

interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export function useRegisterQuery() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      return await apiClient.register(data);
    },
  });
}

