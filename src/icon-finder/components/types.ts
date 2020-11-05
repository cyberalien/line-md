/**
 * Types used to pass data between components
 */
import type { CollectionViewBlocks, FiltersFilter } from '@iconify/search-core';

/**
 * Tab
 */
export interface Tab {
	// Unique key
	key: string;

	// Title
	title: string;

	// Anchor title
	hint?: string;

	// Optional index for background
	index?: number;

	// Tab type
	type?: string;

	// Link and event
	href?: string;
	onClick?: () => void;

	// Icon
	icon?: string;

	// True if tab should be displayed on the right side
	right?: boolean;
}

/**
 * Icons list modes
 */
export type IconsListMode = 'list' | 'grid';

/**
 * Icons list filters
 */
export interface IconsListFilter {
	action: keyof CollectionViewBlocks;
	value: string;
	item: FiltersFilter;
}
