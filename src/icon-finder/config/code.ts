import type { CodeConfig } from '../footer/types';

/**
 * Configuration for API providers for code samples
 */
export const codeConfig: CodeConfig = {
	providers: Object.create(null),

	// Default configuration
	defaultProvider: {
		raw: true,
	},
};

// Add default provider
codeConfig.providers[''] = {
	// Show packages that use API
	api: '',
	// NPM packages for React, Vue, Svelte components
	npmES: {
		package: '@iconify-icons/{prefix}',
		file: '/{name}',
	},
	npmCJS: {
		package: '@iconify/icons-{prefix}',
		file: '/{name}',
	},
	// Allow generating SVG
	raw: true,
	// Remote SVGs
	svg: 'https://api.iconify.design/{prefix}/{name}.svg',
};
