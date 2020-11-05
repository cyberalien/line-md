import type {
	PartialRoute,
	Icon,
	IconFinderConfig,
} from '@iconify/search-core';
import type { PartialIconCustomisations } from '../customisations/types';
import type { IconFinderState } from './state';

/**
 * Life cycle events
 */

// Event triggered when component has been loaded for the first time, ready to be modified
export interface IconFinderLoadEvent {
	type: 'load';
}

type IconFinderLifeCycleEvents = IconFinderLoadEvent;

/**
 * State events
 */

// Event triggered when route changes
export interface IconFinderRouteEvent {
	type: 'route';
	route: PartialRoute;
}

// Event triggered when selection has been changed
export interface IconFinderSelectionEvent {
	type: 'selection';
	icons: Icon[];
}

// Event triggered when customisations have changed
export interface IconFinderCustomisationsEvent {
	type: 'customisations';
	customisations: PartialIconCustomisations;
}

// Event triggered when configuration changes
export interface IconFinderConfigEvent {
	type: 'config';
	config: IconFinderConfig;
}

type IconFinderStateEvents =
	| IconFinderRouteEvent
	| IconFinderSelectionEvent
	| IconFinderCustomisationsEvent
	| IconFinderConfigEvent;

/**
 * Actions
 */

// Event triggered when button was clicked in footer
export interface IconFinderButtonEvent {
	type: 'button';
	button: string;
	state: IconFinderState;
}

type IconFinderActionEvents = IconFinderButtonEvent;

/**
 * All events
 */
export type IconFinderEvent =
	| IconFinderLifeCycleEvents
	| IconFinderStateEvents
	| IconFinderActionEvents;
