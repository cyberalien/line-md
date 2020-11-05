import type { Icon, FullRoute } from '@iconify/search-core';

export function shortenIconName(
	route: FullRoute,
	icon: Icon,
	fullName: string
): string {
	if (!route) {
		return fullName;
	}

	switch (route.type) {
		case 'collections':
		case 'search':
		case 'collection':
			break;

		default:
			return fullName;
	}

	const params = route.params;

	// Get and check provider
	const provider =
		params && typeof params.provider === 'string' ? params.provider : '';
	if (icon.provider !== provider) {
		return fullName;
	}

	// Check if icon has same prefix (only for collection)
	if (route.type === 'collection' && icon.prefix === route.params.prefix) {
		return icon.name;
	}

	// Remove only provider
	return icon.prefix + ':' + icon.name;
}
