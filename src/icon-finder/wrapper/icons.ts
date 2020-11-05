import type { Icon } from '@iconify/search-core';

/**
 * Type of icon selection:
 *
 * boolean = select/deselect
 * 'toggle' = toggle
 * 'force' = force selection: deselect other icons
 */
export type SelectIcon = true | false | 'toggle' | 'force';

/**
 * Selected icons: [provider][prefix] = array of names
 */
export type SelectedIcons = Record<string, Record<string, string[]>>;

/**
 * Add icon to selection
 */
export function addToSelection(icons: SelectedIcons, icon: Icon): boolean {
	if (icons[icon.provider] === void 0) {
		icons[icon.provider] = Object.create(null);
	}
	const providerIcons = icons[icon.provider];

	if (providerIcons[icon.prefix] === void 0) {
		providerIcons[icon.prefix] = [];
	}
	const list = providerIcons[icon.prefix];

	if (list.indexOf(icon.name) === -1) {
		list.push(icon.name);
		return true;
	}
	return false;
}

/**
 * Remove icon from selection
 */
export function removeFromSelection(icons: SelectedIcons, icon: Icon): boolean {
	if (
		icons[icon.provider] === void 0 ||
		icons[icon.provider][icon.prefix] === void 0
	) {
		return false;
	}

	const providerIcons = icons[icon.provider];
	let oldCount = providerIcons[icon.prefix].length;

	const matches = icon.aliases
		? icon.aliases.concat([icon.name])
		: [icon.name];
	providerIcons[icon.prefix] = providerIcons[icon.prefix].filter(
		(name) => matches.indexOf(name) === -1
	);

	const found = oldCount !== providerIcons[icon.prefix].length;
	if (!providerIcons[icon.prefix].length) {
		// Clean up
		delete providerIcons[icon.prefix];
		if (!Object.keys(providerIcons).length) {
			delete icons[icon.provider];
		}
	}

	return found;
}

/**
 * Check if icon is selected
 */
export function isIconSelected(icons: SelectedIcons, icon: Icon): boolean {
	// Check if provider and prefix exist
	if (icons[icon.provider] === void 0) {
		return false;
	}
	const provider = icons[icon.provider];
	if (provider[icon.prefix] === void 0) {
		return false;
	}

	// Check name and aliases
	const list = provider[icon.prefix];
	if (list.indexOf(icon.name) !== -1) {
		return true;
	}

	if (icon.aliases) {
		for (let i = 0; i < icon.aliases.length; i++) {
			if (list.indexOf(icon.aliases[i]) !== -1) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Convert selection to array
 */
export function selectionToArray(icons: SelectedIcons): Icon[] {
	const result: Icon[] = [];
	Object.keys(icons).forEach((provider) => {
		Object.keys(icons[provider]).forEach((prefix) => {
			icons[provider][prefix].forEach((name) => {
				result.push({
					provider,
					prefix,
					name,
				});
			});
		});
	});
	return result;
}
