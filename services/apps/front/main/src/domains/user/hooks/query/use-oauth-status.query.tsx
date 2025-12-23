import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type OAuthProvider = 'naver' | 'google' | 'kakao';

interface OAuthStatus {
  naver: boolean;
  google: boolean;
  kakao: boolean;
}

const API_AUTH_URL = '/api/auth';

async function checkOAuthStatus(provider: OAuthProvider): Promise<boolean> {
  try {
    await axios.get(`${API_AUTH_URL}/${provider}`, {
      validateStatus: (status) => status < 500, // 404는 정상 응답으로 처리
    });
    return true;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false;
    }
    return false;
  }
}

export function useOAuthStatusQuery() {
  return useQuery<OAuthStatus>({
    queryKey: ['oauthStatus'],
    queryFn: async () => {
      const [naver, google, kakao] = await Promise.all([
        checkOAuthStatus('naver').catch(() => false),
        checkOAuthStatus('google').catch(() => false),
        checkOAuthStatus('kakao').catch(() => false),
      ]);
      return { naver, google, kakao };
    },
  });
}

