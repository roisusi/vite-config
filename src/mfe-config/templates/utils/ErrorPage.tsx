import { FC } from 'react';
import { useRouteError } from 'react-router-dom';
import { UmtbTypography } from '@umtb/shared-ui-cmp';

const ERROR_MESSAGE = 'הדף שנמצא אינו קיים';

export const ErrorPage: FC = () => {
	const errorMsg = useRouteError() as { message: string; data: string };

	return (
		<div>
			<UmtbTypography variant="title">{ERROR_MESSAGE}</UmtbTypography>
			<UmtbTypography variant="body-medium">
				{errorMsg.message || errorMsg.data}
			</UmtbTypography>
		</div>
	);
};
