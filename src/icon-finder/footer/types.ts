import type { FullRoute, Icon } from '@iconify/search-core';
import type { CodeSampleAPIConfig } from '@iconify/search-core/lib/code-samples/types';
import type { WrappedRegistry } from '../wrapper/registry';

/**
 * Button type
 */
type FooterButtonType = 'primary' | 'secondary' | 'destructive';

/**
 * Display condition for buttons
 */
export type FooterButtonDisplay =
	// Always show button
	| 'always'
	// Show button only when no icons have been selected
	| 'empty'
	// Show button only when one icon has been selected
	| 'one-icon'
	// Show button only when multiple icons have been selected
	| 'many-icons'
	// Show button when one or more icons have been selected (combination of 'one-icon' and 'many-icons')
	| 'icons';

/**
 * Parameters for callback
 */
export interface FooterButtonCallbackParams {
	// Button key
	key: string;

	// Button item
	button: FooterButton;

	// Registry instance
	registry: WrappedRegistry;

	// Current route
	route: FullRoute;

	// Selected icon(s)
	icons: Icon[];
}

/**
 * Callback that returns if button should be shown
 */
export type FooterButtonDisplayCallback = (
	button: FooterButtonCallbackParams
) => boolean;

/**
 * Callback that returns button title
 */
export type FooterButtonTextCallback = (
	button: FooterButtonCallbackParams
) => string;

/**
 * Footer button
 */
export interface FooterButton {
	// Button type. Default = 'primary'
	type?: FooterButtonType;

	// Button text. If missing, text will be generated using this logic:
	// 1. phrases for key will be checked: footerButtons[key]
	// 2. key will be capitalised: 'submit' => 'Submit'
	text?: string | FooterButtonTextCallback;

	// Optional icon. Iconify icon name. Use "iif-custom" prefix for icons defined in theme
	icon?: string;

	// Display condition: string or callback. Default = 'icons'
	display?: FooterButtonDisplay | FooterButtonDisplayCallback;
}

/**
 * Configuration
 */
export interface CodeConfig {
	// Config for providers
	providers: Record<string, CodeSampleAPIConfig>;

	// Default provider
	defaultProvider: CodeSampleAPIConfig;
}
