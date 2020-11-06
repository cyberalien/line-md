import type { FooterButton, FooterButtonCallbackParams } from '../footer/types';

/**
 * Can show and add API providers?
 */
export const showProviders = false;
export const canAddProviders = false;

/**
 * Automatically focus search
 */
export const canFocusSearch = false;

/**
 * Show collection information block (author, license, etc...) when browsing collection
 */
export const showCollectionInfoBlock = true;

/**
 * Can shorten icon name in footer?
 */
export const canShortenIconName = true;

/**
 * Show title for properties block?
 */
export const showPropsTitle = false;

/**
 * List of properties to customise
 */
// Global toggle: disables all properties
export const showCustomisatons = true;

// Color
export const customiseColor = true;

// Size
export const customiseWidth = true;
export const customiseHeight = true;

// Rotation
export const customiseRotate = true;

// Flip
export const customiseFlip = true;

// Inline / block
export const customiseInline = false;

/**
 * Default values for color, width and height
 */
export const defaultColor = '#000';
export const defaultWidth = '';
export const defaultHeight = '';

/**
 * Limits for sample icon in footer
 */
export const iconSampleSize = {
	width: 200,
	height: 300,
};

/**
 * Footer buttons
 */
export const showButtons = true;

export const footerButtons: Record<string, FooterButton> = {
	submit: {
		type: 'primary',
		display: 'icons', // Show only when icon(s) have been selected
	},
	cancel: {
		type: 'secondary',
	},
};

/**
 * Sample code
 */
// To disable code block, also change link for CodeBlock to Empty.svelte in ./components.ts (it will remove component from bundle)
export const showCode = false;
