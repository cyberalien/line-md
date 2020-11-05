import type { IconCustomisations, PartialIconCustomisations } from './types';

/**
 * Empty values
 */
export const emptyCustomisations: IconCustomisations = {
	hFlip: false,
	vFlip: false,
	rotate: 0,
	color: '',
	width: '',
	height: '',
	inline: false,
};

/**
 * Default values
 */
export const defaultCustomisations: IconCustomisations = {
	hFlip: false,
	vFlip: false,
	rotate: 0,
	color: '',
	width: '',
	height: '',
	inline: false,
};

/**
 * Add missing values to customisations, creating new object. Function does type checking
 */
export function mergeCustomisations(
	defaults: IconCustomisations,
	values: PartialIconCustomisations
): IconCustomisations {
	let result: Record<string, unknown> = {};
	for (let key in defaults) {
		const attr = key as keyof IconCustomisations;
		if (values && typeof values[attr] === typeof defaults[attr]) {
			result[attr] = values[attr];
		} else {
			result[attr] = defaults[attr];
		}
	}
	return (result as unknown) as IconCustomisations;
}

/**
 * Export only customised attributes
 */
export function filterCustomisations(
	values: IconCustomisations
): PartialIconCustomisations {
	let result: PartialIconCustomisations = {};
	for (let key in defaultCustomisations) {
		const attr = key as keyof IconCustomisations;
		if (
			values[attr] !== defaultCustomisations[attr] &&
			values[attr] !== emptyCustomisations[attr]
		) {
			(result as Record<string, unknown>)[attr] = values[attr];
		}
	}
	return result;
}
