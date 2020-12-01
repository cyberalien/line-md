import type {
	Icon,
	PartialRoute,
	IconFinderConfig,
} from '@iconify/search-core';
import type { PartialIconCustomisations } from '@iconify/search-core/lib/misc/customisations';

/**
 * Icon finder state.
 *
 * All elements could be empty
 */
export interface InitialIconFinderState {
	// Selected icons
	icons: (Icon | string)[];

	// Customisations
	customisations: PartialIconCustomisations;

	// Current route
	route?: PartialRoute;

	// Config changes
	config?: IconFinderConfig;
}

// Override icons
export interface IconFinderState extends InitialIconFinderState {
	icons: Icon[];
}
