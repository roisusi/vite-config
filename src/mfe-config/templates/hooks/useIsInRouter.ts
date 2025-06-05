import { useLocation } from 'react-router-dom';

interface UseIsInRouterResult {
	isWithinRouter: boolean;
	pathname?: string;
}

export const useIsInRouter = (): UseIsInRouterResult => {
	try {
		const location = useLocation();
		return { isWithinRouter: true, pathname: location.pathname };
	} catch {
		return { isWithinRouter: false };
	}
};
