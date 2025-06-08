import { describe, expect, test } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestingProviderWrapper } from '@utils/Tests';
import App from './App';

const queryClient = new QueryClient();

describe('App component', () => {
	test('renders App component', async () => {
		const { getByTestId } = render(
			<QueryClientProvider client={queryClient}>
				<TestingProviderWrapper>
					<App />
				</TestingProviderWrapper>
			</QueryClientProvider>
		);

		await waitFor(() =>
			getByTestId('dna-skeleton_body-mfe-ishurim-ve-tfasim-shadow_wrapper')
		);

		expect(
			getByTestId('dna-skeleton_body-mfe-ishurim-ve-tfasim-shadow_wrapper')
		).toBeInTheDocument();
	});
});
