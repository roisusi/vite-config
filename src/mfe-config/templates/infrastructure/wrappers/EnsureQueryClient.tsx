import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useIsInQueryProvider } from '@mfe-{<MFE NAME>}/hooks/useIsInQueryProvider';
import {
	ErrorDetailsType,
	extractErrorMessage,
	isErrorDetailsType,
} from '@umtb/shared-ui-utils';

interface EnsureQueryClientProps {
	children: ReactNode;
}

export const EnsureQueryClient: FC<EnsureQueryClientProps> = ({ children }) => {
	const { isWithinQueryProvider } = useIsInQueryProvider();

	if (!isWithinQueryProvider) {
		const queryClient = new QueryClient({
			defaultOptions: {
				queries: {
					retry: 2,
					refetchOnWindowFocus: false,
				},
				mutations: {
					onError: (error) => {
						if (isErrorDetailsType(error)) {
							return extractErrorMessage(error as unknown as ErrorDetailsType);
						}
						return 'Internal server error';
					},
				},
			},
		});

		return (
			<QueryClientProvider client={queryClient}>
				<ReactQueryDevtools initialIsOpen={false} />
				{children}
			</QueryClientProvider>
		);
	}

	return <>{children}</>;
};
