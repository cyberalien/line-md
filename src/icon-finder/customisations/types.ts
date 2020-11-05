/**
 * Customisations
 */
export interface IconCustomisations {
	// Transformations
	hFlip: boolean;
	vFlip: boolean;
	rotate: number;

	// Color for color picker
	color: string;

	// Dimensions
	width: string;
	height: string;

	// Display mode
	inline: boolean;

	// Note: when adding new property, do not forget to add key/value pair below
}

export type PartialIconCustomisations = Partial<IconCustomisations>;
