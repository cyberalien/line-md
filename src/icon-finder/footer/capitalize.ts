// Split numbers
const unitsSplit = /([0-9]+[0-9.]*)/g;

/**
 * Capitalize string: split by dash and numbers
 */
export function capitalize(str: string, split = '-'): string {
	return str
		.split(split)
		.map((item) => {
			return item
				.split(unitsSplit)
				.filter((item) => item.length > 0)
				.map((item) => item.slice(0, 1).toUpperCase() + item.slice(1))
				.join(' ');
		})
		.join(' ');
}
