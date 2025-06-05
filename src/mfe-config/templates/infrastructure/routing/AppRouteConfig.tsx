import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { AppRoot } from '@mfe-{<MFE NAME>}/components/AppRoot';
import { ErrorPage } from '@mfe-{<MFE NAME>}/utils/ErrorPage';

export const routes: RouteObject[] = [
	{ element: <AppRoot />, errorElement: <ErrorPage />, children: [] },
];

export const createAppRouter = createBrowserRouter(routes);
