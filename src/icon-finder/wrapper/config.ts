/**
 * Components config
 */
export interface ComponentsConfig {
	// Icons list mode.
	list?: boolean;

	// True if icons list mode can be changed.
	toggleList?: boolean;

	// Active code tab
	codeTab?: string;

	// Can select multiple icons
	multiSelect: boolean;
}

/**
 * Default values
 */
export const defaultComponentsConfig: Required<ComponentsConfig> = {
	// Icons list mode.
	list: false,

	// True if icons list mode can be changed.
	toggleList: true,

	// Active code tab
	codeTab: '',

	// Can select multiple icons
	multiSelect: false,
};
