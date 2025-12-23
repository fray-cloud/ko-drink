import { ButtonHTMLAttributes } from 'react';

interface OAuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'naver' | 'google' | 'kakao';
  enabled: boolean;
}

const providerLabels = {
  naver: '네이버',
  google: '구글',
  kakao: '카카오',
};

const API_AUTH_URL = '/api/auth';

export function OAuthButton({ provider, enabled, ...props }: OAuthButtonProps) {
  const handleClick = () => {
    if (enabled) {
      window.location.href = `${API_AUTH_URL}/${provider}`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!enabled}
      className={`w-full px-4 py-2 rounded ${
        enabled
          ? 'bg-blue-500 text-white hover:bg-blue-600'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      {...props}
    >
      {providerLabels[provider]} 로그인
    </button>
  );
}

