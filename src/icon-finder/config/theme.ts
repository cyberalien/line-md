import { addCollection } from '@iconify/svelte';

/**
 * Maximum color index (number of colors in rotation - 1)
 *
 * See _rotation.scss in style directory
 */
export const maxIndex = 11;

/**
 * Collections list options
 */
// Show author link. Disable if whole block should be clickable
export const showCollectionAuthorLink = true;

// True if entire collection block should be clickable
export const collectionClickable = false;

/**
 * Import custom icons
 */
const customIconsPrefix = 'icon-finder-theme';
export function importThemeIcons() {
	addCollection({
		prefix: customIconsPrefix,
		icons: {
			'error-loading': {
				body:
					'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
			},
			'empty': {
				body: '',
			},
		},
		width: 16,
		height: 16,
	});
}

/**
 * Icons used by UI
 */
export const icons: Record<string, string | null> = {
	'reset': 'line-md:close',
	'search': 'line-md:search',
	'down': 'line-md:chevron-down',
	'left': 'line-md:chevron-left',
	'right': 'line-md:chevron-right',
	'parent': 'line-md:chevron-small-left',
	'expand': 'line-md:chevron-small-right',
	'grid': 'line-md:grid-3-solid',
	'list': 'line-md:list-3-solid',
	'check-list': 'line-md:check-list-3-solid',
	'check-list-checked': 'line-md:check-list-3-twotone',
	'error-loading': customIconsPrefix + ':error-loading',
	'icon-width': 'line-md:double-arrow-horizontal',
	'icon-height': 'line-md:double-arrow-vertical',
	'color': 'line-md:paint-drop-half-twotone',
	'color-filled': 'line-md:paint-drop-filled',
	'rotate0': 'line-md:close',
	'rotate1': 'line-md:rotate-90',
	'rotate2': 'line-md:rotate-180',
	'rotate3': 'line-md:rotate-270',
	'h-flip': 'line-md:double-arrow-horizontal',
	'v-flip': 'line-md:double-arrow-vertical',
	'plus': 'line-md:plus',
	'link': 'line-md:external-link',
	'clipboard': 'line-md:clipboard-arrow-twotone',
	'confirm': 'line-md:confirm',
	'docs': 'line-md:document-list-twotone',
	'mode-block': 'line-md:valign-baseline',
	'mode-inline': 'line-md:valign-middle',
	'selecting-selected': 'line-md:confirm',
	'selecting-unselected': customIconsPrefix + ':empty',
};

/**
 * Class to add to icons
 */
export const iconsClass: string = 'iconify--line-md';
