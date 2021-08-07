import type { UITranslation } from './types';

/**
 * Phrases.
 *
 * Do not import phrases from this file, use ../config/phrases.ts instead
 */
export const phrases: UITranslation = {
	lang: 'English',
	search: {
		placeholder: {
			collection: 'Search {name}',
			collections: 'Filter collections',
		},
		defaultPlaceholder: 'Search all icons',
		button: 'Search Icons',
	},
	errors: {
		noCollections: 'No matching icon sets found.',
		noIconsFound: 'No icons found.',
		defaultError: 'Error loading Iconify Icon Finder.',
		custom: {
			loading: 'Loading...',
			timeout: 'Could not connect to Iconify API.',
			invalid_data: 'Invalid response from Iconify API.',
			empty: 'Nothing to show.',
			not_found: 'Collection {prefix} does not exist.',
			bad_route: 'Invalid route.',
			home: 'Click here to return to main page.',
		},
	},
	icons: {
		header: {
			full: 'Displaying {count} icons:',
			more:
				'Displaying {count} icons (click second page to load more results):',
			modes: {
				list: 'Display icons as list',
				grid: 'Display icons as grid',
			},
			select: 'Select multiple icons',
		},
		headerWithCount: {
			0: 'No icons to display.',
			1: 'Displaying 1 icon:',
		},
		tooltip: {
			size: '\nSize: {size}',
			colorless: '',
			colorful: '\nHas palette',
			char: '\nIcon font character: {char}',
			length: '', //'\nContent: {length} bytes',
		},
		more: 'Find more icons', // '3 ...',
		moreAsNumber: false, // True if text above refers to third page, false if text above shows "Find more icons" or similar text
	},
	pagination: {
		prev: 'Previous page',
		next: 'Next page',
	},
	filters: {
		'uncategorised': 'Uncategorised',
		'collections': 'Filter search results by icon set:',
		'collections-collections': '',
		'tags': 'Filter by category:',
		'themePrefixes': 'Icon type:',
		'themeSuffixes': 'Icon type:',
	},
	collectionInfo: {
		total: 'Number of icons:',
		height: 'Height of icons:',
		author: 'Author:',
		license: 'License:',
		palette: 'Palette:',
		colorless: 'Colorless',
		colorful: 'Has colors',
		link: 'Show all icons',
	},
	parent: {
		default: 'Return to previous page',
		collections: 'Return to collections list',
		collection: 'Return to {name}',
		search: 'Return to search results',
	},
	collection: {
		by: 'by ',
	},
	providers: {
		section: 'Icons source:',
		add: 'Add Provider',
		addForm: {
			title: "Enter API provider's host name:",
			placeholder: 'https://api.iconify.design',
			submit: 'Add API Provider',
			invalid:
				'Example of a valid API host name: https://api.iconify.design',
		},
		status: {
			loading: 'Checking {host}...',
			error: '{host} is not a valid Iconify API.',
			exists:
				'API from {host} is already available or API has wrong configuration.',
			unsupported: 'API from {host} does not support icon search.',
		},
	},
	footer: {
		iconName: 'Selected icon:',
		iconNamePlaceholder: 'Enter icon by name...',
		inlineSample: {
			before: 'Text with icon sample',
			after: 'to show icon alignment in text.',
		},
		remove: 'Remove {name}',
		select: 'Select {name}',
		about: 'Aboout {title}',
	},
	footerButtons: {
		submit: 'Submit',
		change: 'Change',
		select: 'Select',
		cancel: 'Cancel',
		close: 'Close',
	},
	footerBlocks: {
		title: 'Customize icon',
		title2: 'Customize icons',
		color: 'Color',
		flip: 'Flip',
		hFlip: 'Horizontal',
		vFlip: 'Vertical',
		rotate: 'Rotate',
		width: 'Width',
		height: 'Height',
		size: 'Size', // Width + height in one block
		alignment: 'Alignment',
		mode: 'Mode',
		icons: 'Selected icons',
	},
	footerOptionButtons: {
		hFlip: 'Horizontal',
		vFlip: 'Vertical',
		rotate: '{num}' + String.fromCharCode(0x00b0),
		rotateTitle: 'Rotate {num}' + String.fromCharCode(0x00b0),
		inline: 'Inline',
		block: 'Block',
		inlineHint:
			'Icon is vertically aligned slightly below baseline, like icon font, fitting perfectly in text.',
		blockHint: 'Icon is rendered as is, without custom vertical alignment.',
	},
	codeSamples: {
		copy: 'Copy to clipboard',
		copied: 'Copied to clipboard.',
		headingHidden: 'Show code for "{name}" for developers',
		heading: 'Code for "{name}" for developers',
		childTabTitle: '{key} versions:',
		childTabTitles: {
			react: 'React component versions:',
			svg: 'SVG options:',
		},
		docsDefault: 'Click here for more information about {title} component.',
		docs: {
			iconify:
				'Click here for more information about Iconify SVG framework.',
			css: 'Click here for more code examples.',
		},
		intro: {
			'svg-box':
				'This SVG contains extra empty rectangle that matches viewBox. It is needed to keep icon dimensions when importing icon in software that ignores viewBox attribute.',
			'svg-uri':
				'You can use this as background image or as content for pseudo element in stylesheet.',
			'css':
				"Add code below to your stylesheet to use icon as background image or as pseudo element's content:",
		},
		component: {
			'install-offline': 'Install component and icon set:',
			'install-simple': 'Install component:',
			'install-addon': 'Install addon:',
			'import-offline': 'Import component and icon data:',
			'import-simple': 'Import component:',
			'vue-offline':
				'Add icon data and icon component to your component:',
			'vue-simple': 'Add icon component to your component:',
			'use-in-code': 'Use it in your code:',
			'use-in-html': 'Use it in HTML code:',
			'use-in-template': 'Use component in template:',
			'use-generic': '',
		},
		iconify: {
			intro1:
				'Iconify SVG framework makes using icons as easy as icon fonts. To use "{name}" in HTML, add this code to the document:',
			intro2:
				'Iconify SVG framework will load icon data from Iconify API and replace that placeholder with SVG.',
			head: 'Make sure you import Iconify SVG framework:',
		},
	},
};
