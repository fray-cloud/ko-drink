import { Outlet, Link } from 'react-router-dom';
import { KO_DRINK_ROUTES, USER_ROUTES } from '../router';
import { useAuthService } from '../../domains/user/hooks/use-auth.service';
import { ThemeToggle } from '../../domains/common/components/ThemeToggle';

export function RootLayout() {
  const { isAuthenticated, logout, currentUser } = useAuthService();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Ko-Drink
              </Link>
              <nav className="ml-8 space-x-4">
                <Link
                  to={KO_DRINK_ROUTES.SEARCH}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  검색
                </Link>
                <Link
                  to={KO_DRINK_ROUTES.BOOKS}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  문헌
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 dark:text-gray-300">{currentUser?.name}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  to={USER_ROUTES.LOGIN}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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

