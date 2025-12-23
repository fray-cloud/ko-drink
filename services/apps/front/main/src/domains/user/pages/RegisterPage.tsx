import { RegisterForm } from '../components/RegisterForm';
import { Link } from 'react-router-dom';
import { USER_ROUTES } from '../router';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">회원가입</h1>
        <RegisterForm />
        <div className="text-center text-sm">
          이미 계정이 있으신가요?{' '}
          <Link to={USER_ROUTES.LOGIN} className="text-blue-500 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

