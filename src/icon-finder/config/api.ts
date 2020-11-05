import { convertProviderData, addProvider } from '@iconify/search-core';
import type { APIProviderRawData } from '@iconify/types/provider';
import type { WrappedRegistry } from '../wrapper/registry';

/**
 * List of custom API providers
 *
 * Each array item must have:
 *  provider: unique provider key, similar to icon set prefix
 *  title: title to show in API providers tabs (used if showProviders is enabled in ./components.ts)
 *  api: host name(s) as string or array of strings
 */
const customProviders: APIProviderRawData[] = [
	/*
	{
		provider: 'local',
		title: 'Local Test',
		api: 'http://localhost:3100',
    },
    */
];

/**
 * Add custom API providers
 */
export function addCustomAPIProviders(registry: WrappedRegistry) {
	if (customProviders.length) {
		customProviders.forEach((item) => {
			const converted = convertProviderData('', item);
			if (converted) {
				addProvider(item.provider, converted);
			}
		});

		// Set default API provider in router
		// registry.router.defaultProvider = customProviders[0].provider;
	}
}
