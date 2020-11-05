import type { UITranslation } from './types';
import { phrases } from '../config/phrases';

type Item = Record<string, unknown>;

/**
 * Merge custom phrases
 */
export function mergePhrases(
	items: (UITranslation | Record<string, unknown>)[]
) {
	function merge(storage: Item, item: Item) {
		for (const key in item) {
			const value = item[key];

			// New item or type mismatch
			if (
				storage[key] === void 0 ||
				typeof storage[key] !== typeof value
			) {
				storage[key] = value;
				continue;
			}

			// Merge items of the same type that aren't objects
			if (
				typeof item !== 'object' ||
				item === null ||
				storage[key] === null
			) {
				// Scalar or null
				storage[key] = value;
				continue;
			}

			// Merge objects
			merge(storage[key] as Item, value as Item);
		}
	}

	items.forEach((item) => {
		merge((phrases as unknown) as Item, item as Item);
	});
}
