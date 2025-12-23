import { RouteObject } from 'react-router-dom';
import { SearchPage } from './pages/SearchPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { DetailPage } from './pages/DetailPage';

export const KO_DRINK_ROUTES = {
  SEARCH: '/ko-drink/search',
  RESULTS: '/ko-drink/results',
  DETAIL: '/ko-drink/detail',
} as const;

export const koDrinkRoutes: RouteObject[] = [
  {
    path: KO_DRINK_ROUTES.SEARCH,
    element: <SearchPage />,
  },
  {
    path: KO_DRINK_ROUTES.RESULTS,
    element: <SearchResultsPage />,
  },
  {
    path: KO_DRINK_ROUTES.DETAIL,
    element: <DetailPage />,
  },
];

