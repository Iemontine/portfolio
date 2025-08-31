import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
	it('renders without crashing and shows app container', () => {
		const { container } = render(<App />);
		expect(container.querySelector('#app-container')).toBeTruthy();
	});
});
