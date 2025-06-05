import { RouterProvider } from 'react-router-dom';
import { FC } from 'react';
import { useIsInRouter } from '@mfe-{<MFE NAME>}/hooks/useIsInRouter';
import { createAppRouter } from '@mfe-{<MFE NAME>}/infrastructure/routing/AppRoutesConfig';
import { OwnRouter } from '@mfe-{<MFE NAME>}/infrastructure/routing/OwnRouter';

export const EnsureRouter: FC = () => {
	const { isWithinRouter } = useIsInRouter();

	if (!isWithinRouter) {
		return <RouterProvider router={createAppRouter} />;
	}

	return <OwnRouter />;
};
