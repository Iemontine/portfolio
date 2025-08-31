// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Polyfill IntersectionObserver for jsdom test environment
if (typeof (global as any).IntersectionObserver === 'undefined') {
	class MockIntersectionObserver {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		constructor(callback: any, options?: any) {}
		observe = vi.fn();
		unobserve = vi.fn();
		disconnect = vi.fn();
		takeRecords = vi.fn().mockReturnValue([] as IntersectionObserverEntry[]);
	}
	// @ts-ignore - assign to global/window for tests
	(global as any).IntersectionObserver = MockIntersectionObserver;
	// @ts-ignore
	(window as any).IntersectionObserver = MockIntersectionObserver;
}
