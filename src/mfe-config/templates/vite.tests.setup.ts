import '@testing-library/jest-dom';
import { afterAll, beforeAll, vi } from 'vitest';

class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

global.ResizeObserver = ResizeObserver;

beforeAll(() => {
	vi.stubGlobal('fetch', vi.fn());
});

afterAll(() => {
	vi.unstubAllGlobals();
});
