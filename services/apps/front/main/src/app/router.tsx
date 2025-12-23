import { createBrowserRouter, RouteObject, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { userRoutes, USER_ROUTES } from '../domains/user/router';
import { koDrinkRoutes, KO_DRINK_ROUTES } from '../domains/ko-drink/router';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={KO_DRINK_ROUTES.SEARCH} replace />,
      },
      ...koDrinkRoutes,
    ],
  },
  {
    element: <AuthLayout />,
    children: [...userRoutes],
  },
];

export const router = createBrowserRouter(routes);

export { USER_ROUTES, KO_DRINK_ROUTES };

