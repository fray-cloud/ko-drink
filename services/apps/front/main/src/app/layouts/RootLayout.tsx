import { Outlet, Link } from 'react-router-dom';
import { KO_DRINK_ROUTES, USER_ROUTES } from '../router';
import { useAuthService } from '../../domains/user/hooks/use-auth.service';

export function RootLayout() {
  const { isAuthenticated, logout, currentUser } = useAuthService();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold">
                Ko-Drink
              </Link>
              <nav className="ml-8 space-x-4">
                <Link
                  to={KO_DRINK_ROUTES.SEARCH}
                  className="text-gray-700 hover:text-gray-900"
                >
                  검색
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700">{currentUser?.name}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  to={USER_ROUTES.LOGIN}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

