import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TestErrorBoundary } from './TestErrorBoundary';
import { privateTheme, UmtbThemeProvider } from '@umtb/shared-ui-cmp';
import { UmtbI18nProvider } from '@umtb/shared-i18n';
interface TestingProviderWrapperProps {
	children: ReactNode;
	client?: QueryClient;
}
const queryClient = new QueryClient({
	defaultOptions: { queries: { retry: false, staleTime: 0 } },
});
export const TestingProviderWrapper: FC<TestingProviderWrapperProps> = ({
	children,
	client = queryClient,
}) => {
	return (
		<UmtbI18nProvider
			i18nConfig={{
				isDevMode: true,
				localResourcesPath: '/resources',
				platform: 'business',
			}}
		>
			{' '}
			<UmtbThemeProvider baseTheme={privateTheme} direction="ltr">
				{' '}
				<TestErrorBoundary>
					{' '}
					<BrowserRouter>
						{' '}
						<QueryClientProvider client={client}>
							{' '}
							{children}{' '}
						</QueryClientProvider>{' '}
					</BrowserRouter>{' '}
				</TestErrorBoundary>{' '}
			</UmtbThemeProvider>{' '}
		</UmtbI18nProvider>
	);
};
