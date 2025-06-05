import { useRoutes } from 'react-router-dom';
import { routes } from '@mfe-{<MFE NAME>}/infrastructure/routing/AppRoutesConfig';
import { FC } from 'react';

export const OwnRouter: FC = () => {
	const ownRoutes = useRoutes(routes);
	return <>{ownRoutes}</>;
};
