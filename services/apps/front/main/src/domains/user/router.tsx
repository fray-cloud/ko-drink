import { RouteObject } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const USER_ROUTES = {
  LOGIN: '/user/login',
  REGISTER: '/user/register',
  PROFILE: '/user/profile',
} as const;

export const userRoutes: RouteObject[] = [
  {
    path: USER_ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: USER_ROUTES.REGISTER,
    element: <RegisterPage />,
  },
];

