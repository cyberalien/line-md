import type { APIProviderRawData } from '@iconify/types/provider';
import type { Registry, APIProviderSource } from '@iconify/search-core';
import {
	convertProviderData,
	addProvider,
	listProviders,
} from '@iconify/search-core';

// Errors
export type APIProviderError = 'loading' | 'error' | 'unsupported' | 'exists';

/**
 * Validate API provider host
 */
export function validateProvider(url: string): string | null {
	let parts = url.toLowerCase().split('/');

	// Check protocol
	const protocol = parts.shift();
	switch (protocol) {
		case 'http:':
		case 'https:':
			break;

		default:
			return null;
	}

	// Double '/'
	if (parts.shift() !== '') {
		return null;
	}

	// Host
	const host = parts.shift();
	if (typeof host !== 'string') {
		return null;
	}
	const hostParts = host.split(':');
	if (hostParts.length > 2) {
		return null;
	}

	// Validate domain
	const domain = hostParts.shift();
	if (!domain || !domain.match(/^[a-z0-9.-]+$/)) {
		return null;
	}

	// Validate port
	const port = hostParts.shift();
	if (port !== void 0 && !port.match(/^[0-9]+$/)) {
		return null;
	}

	// Return protocol + host, ignore the rest
	return protocol + '//' + host;
}

/**
 * Type for callback
 */
export type RetrieveProviderCallback = (
	host: string,
	success: boolean,
	provider: string | APIProviderError
) => void;

/**
 * Retrieve API provider data
 */
export function retrieveProvider(
	registry: Registry,
	host: string,
	callback: RetrieveProviderCallback
): void {
	// console.log('retrieveProvider:', host);
	const api = registry.api;
	api.sendQuery(host, '/provider', (status, data) => {
		const providerData = data as APIProviderRawData;
		let convertedData: APIProviderSource | null;
		let error: APIProviderError = 'error';
		switch (status) {
			case 'success':
				// Validate
				if (typeof providerData !== 'object') {
					break;
				}

				// Check if API supports provider
				if (typeof providerData.provider !== 'string') {
					error = 'unsupported';
					break;
				}

				// Convert data
				convertedData = convertProviderData(host, providerData);
				if (!convertedData) {
					// console.log('Failed to convert data');
					break;
				}
				const provider = providerData.provider;

				// Check if provider exists
				const list = listProviders();
				if (list.indexOf(provider) !== -1) {
					error = 'exists';
					break;
				}

				// Add provider
				addProvider(provider, convertedData);
				callback(host, true, provider);
				return;
		}
		callback(host, false, error);
	});
}
