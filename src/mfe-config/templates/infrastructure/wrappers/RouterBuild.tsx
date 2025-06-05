import { RouterProvider } from 'react-router-dom';
import { FC, useEffect } from 'react';
import { HostShellData } from '@umtb/shared-ui-utils';
import { useHostShell } from '@umtb/shared-ui-utils/Context/HostShellProvider';
import { useIsInRouter } from '@mfe-{<MFE NAME>}/hooks/useIsInRouter';
import { createAppRouter } from '@mfe-{<MFE NAME>}/infrastructure/routing/AppRoutesConfig';
import { OwnRouter } from '@mfe-{<MFE NAME>}/infrastructure/routing/OwnRouter';

interface EnsureRouterProps {
	hostShellData: HostShellData;
}

export const RouterBuild: FC<EnsureRouterProps> = ({ hostShellData }) => {
	const { isWithinRouter } = useIsInRouter();
	const { setHostShellData } = useHostShell();

	useEffect(() => {
		setHostShellData(hostShellData);
		// eslint-disable-next-line
	}, [hostShellData]);

	if (!isWithinRouter) {
		return <RouterProvider router={createAppRouter()} />;
	} else {
		return <OwnRouter />;
	}
};
