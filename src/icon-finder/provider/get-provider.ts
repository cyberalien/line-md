import type { FullRoute } from '@iconify/search-core';
import type { FullCollectionRouteParams } from '@iconify/search-core/lib/route/types/params';

/**
 * Get active provider from route
 */
export function getActiveProvider(route: FullRoute): string {
	if (!route) {
		return '';
	}

	const params = route.params as FullCollectionRouteParams;
	if (params && typeof params.provider === 'string') {
		return params.provider;
	}
	if (route.parent) {
		return getActiveProvider(route.parent);
	}
	return '';
}
