import type { CodeConfig } from '../footer/types';

/**
 * Configuration for API providers for code samples
 */
export const codeConfig: CodeConfig = {
	providers: Object.create(null),

	// Default configuration
	defaultProvider: {
		iconify: true,
	},
};

// Add default provider
codeConfig.providers[''] = {
	// Show SVG framework
	iconify: true,
	// NPM packages for React, Vue, Svelte components
	npm: '@iconify-icons/{prefix}',
	file: '/{name}',
};
