import { useEffect } from 'react';
import { useLoginQuery } from './query/use-login.query';
import { useRegisterQuery } from './query/use-register.query';
import { useCurrentUserQuery } from './query/use-current-user.query';
import { useOAuthStatusQuery } from './query/use-oauth-status.query';
import { useUserStore } from './store/use-user.store';
import { apiClient } from '../../../common/api-client';
import { useQueryClient } from '@tanstack/react-query';

export function useAuthService() {
  const loginMutation = useLoginQuery();
  const registerMutation = useRegisterQuery();
  const currentUserQuery = useCurrentUserQuery();
  const oauthStatusQuery = useOAuthStatusQuery();
  const { user, isAuthenticated, setUser, clearUser } = useUserStore();
  const queryClient = useQueryClient();

  // 현재 사용자 정보를 store에 동기화
  useEffect(() => {
    if (currentUserQuery.data) {
      setUser(currentUserQuery.data);
    } else if (currentUserQuery.isError) {
      clearUser();
    }
  }, [currentUserQuery.data, currentUserQuery.isError, setUser, clearUser]);

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password });
    if (result.access_token) {
      // 토큰은 apiClient가 자동으로 저장
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
    return result;
  };

  const register = async (email: string, name: string, password: string) => {
    const result = await registerMutation.mutateAsync({ email, name, password });
    if (result.access_token) {
      // 토큰은 apiClient가 자동으로 저장
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
    return result;
  };

  const logout = () => {
    apiClient.logout();
    clearUser();
    queryClient.clear();
  };

  return {
    login,
    register,
    logout,
    currentUser: user,
    isAuthenticated,
    oauthStatus: oauthStatusQuery.data || { naver: false, google: false, kakao: false },
    isLoading: loginMutation.isPending || registerMutation.isPending || currentUserQuery.isLoading,
    isOAuthStatusLoading: oauthStatusQuery.isLoading,
  };
}

