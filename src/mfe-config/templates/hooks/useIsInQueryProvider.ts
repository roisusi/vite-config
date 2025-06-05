import { QueryClient, useQueryClient } from '@tanstack/react-query';

interface UseIsInQueryProviderResult {
	isWithinQueryProvider: boolean;
	queryClient?: QueryClient;
}

export const useIsInQueryProvider = (): UseIsInQueryProviderResult => {
	try {
		const queryClient = useQueryClient();
		return { isWithinQueryProvider: true, queryClient };
	} catch {
		return { isWithinQueryProvider: false };
	}
};
