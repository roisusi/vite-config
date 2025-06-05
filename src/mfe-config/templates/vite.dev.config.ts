import { ProxyOptions } from 'vite';
export const devProxy: Record<string, string | ProxyOptions> = {
	['/api/' + 'ADD HERE JSON SERVER']: {
		target: 'http://localhost:7001',
		changeOrigin: true,
		secure: false,
		rewrite: () => {
			return '/api';
		},
	},
	['/api/' + 'ADD HERE BFF SERVER']: {
		target: 'http://localhost:3000',
		changeOrigin: true,
		rewrite: (path) => path.replace(/^'ADD REGEX HERE'/, ''),
	},
};
