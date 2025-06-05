import { Outlet } from 'react-router-dom';
import { UmtbBody } from '@umtb/shared-ui-cmp';

export const AppRoot = () => {
	return (
		<UmtbBody>
			<Outlet />
		</UmtbBody>
	);
};
