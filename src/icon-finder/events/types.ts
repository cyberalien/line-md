import type { Icon } from '@iconify/search-core';
import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';

// Icon selection
export interface UISelectionEvent {
	type: 'selection';
	// If Icon value is a string, empty string = null
	icon: string | Icon | null;
	// Selection: if set, it toggles icon
	selected?: boolean;
}

// Customisaton has changed
export interface UICustomisationEvent {
	type: 'customisation';
	// Customisation that was changed
	changed: Partial<IconCustomisations>;
	// Current customised customisations
	customisations: IconCustomisations;
}

// Button was clicked in footer
export interface UIFooterButtonEvent {
	type: 'button';
	// Button key
	button: string;
}

// Config was changed
export interface UIConfigEvent {
	type: 'config';
}

// Combined type
export type UIEvent =
	| UISelectionEvent
	| UICustomisationEvent
	| UIFooterButtonEvent
	| UIConfigEvent;
