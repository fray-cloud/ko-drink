import { useAuthService } from '../hooks/use-auth.service';
import { LoginForm } from '../components/LoginForm';
import { OAuthButton } from '../components/OAuthButton';
import { Link } from 'react-router-dom';
import { USER_ROUTES } from '../router';

export function LoginPage() {
  const { oauthStatus, isOAuthStatusLoading } = useAuthService();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">로그인</h1>
        <LoginForm />
        <div className="mt-4">
          <div className="text-center text-sm text-gray-600 mb-4">또는</div>
          <div className="space-y-2">
            {!isOAuthStatusLoading && (
              <>
                <OAuthButton provider="naver" enabled={oauthStatus.naver} />
                <OAuthButton provider="google" enabled={oauthStatus.google} />
                <OAuthButton provider="kakao" enabled={oauthStatus.kakao} />
              </>
            )}
          </div>
        </div>
        <div className="text-center text-sm">
          계정이 없으신가요?{' '}
          <Link to={USER_ROUTES.REGISTER} className="text-blue-500 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

