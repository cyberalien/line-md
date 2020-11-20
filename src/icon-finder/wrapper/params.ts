import type { IconifyJSON } from '@iconify/types';
import type { IconFinderCustomSets } from '@iconify/search-core';
import type { IconFinderEvent } from './events';
import type { InitialIconFinderState } from './state';

/**
 * Wrapper parameters
 */
export interface IconFinderWrapperParams {
	// Container node
	container: HTMLElement;

	// Custom icon sets
	iconSets?: IconFinderCustomSets | IconifyJSON[];

	// Default state
	state?: Partial<InitialIconFinderState>;

	// Callback
	callback: (event: IconFinderEvent) => void;
}
