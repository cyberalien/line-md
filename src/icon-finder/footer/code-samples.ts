import type { IconifyIcon } from '@iconify/iconify';
import Iconify from '@iconify/iconify';
import type { Icon } from '@iconify/search-core';
import { iconToString } from '@iconify/search-core';
import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
import type { ProviderCodeData } from './types';
import type { AvailableLanguages, LanguageKeys } from './code-tree';

function assertNever(v: never) {
	//
}

/**
 * Convert icon name to variable
 */
function varName(iconName: string): string {
	let name = '';
	const parts = iconName.split('-');
	parts.forEach((part, index) => {
		name += index ? part.slice(0, 1).toUpperCase() + part.slice(1) : part;
	});
	if (name.charCodeAt(0) < 97 || name.charCodeAt(0) > 122) {
		// Not a-z - add "icon" at start
		name = 'icon' + name.slice(0, 1).toUpperCase() + name.slice(1);
	} else if (parts.length < 2) {
		// Add "Icon" to avoid reserved keywords
		name += 'Icon';
	}
	return name;
}

/**
 * Check if string contains units
 */
function isNumber(value: unknown): boolean {
	return typeof value === 'number'
		? true
		: typeof value === 'string'
		? !!value.match(/^\-?[0-9.]+$/)
		: false;
}

/**
 * Convert number to degrees string
 */
function degrees(value: number): string {
	return value * 90 + 'deg';
}

/**
 * Convert value to string
 */
function toString(value: unknown): string {
	switch (typeof value) {
		case 'number':
			return value + '';

		case 'string':
			return value;

		default:
			return JSON.stringify(value);
	}
}

/**
 * List of attributes
 */
const baseCustomisationAttributes: (keyof IconCustomisations)[] = [
	'width',
	'height',
	'rotate',
	'hFlip',
	'vFlip',
];
const colorCustomisationAttributes: (keyof IconCustomisations)[] = [
	'color',
].concat(baseCustomisationAttributes) as typeof baseCustomisationAttributes;
const inlineCustomisationAttributes: (keyof IconCustomisations)[] = [
	'inline',
].concat(baseCustomisationAttributes) as typeof baseCustomisationAttributes;
const allCustomisationAttributes: (keyof IconCustomisations)[] = [
	'color',
].concat(inlineCustomisationAttributes) as typeof baseCustomisationAttributes;

/**
 * Documentation
 */
const docsBase = 'https://docs.iconify.design/implementations/';

export interface IconifyCodeDocs {
	href: string;
	type: LanguageKeys;
}

/**
 * Parser instance
 */
// Parser keys
type Attributes = keyof IconCustomisations;

// Callback for parser
type AttributeParser = (list: ParserAttr, value: unknown) => void;

// Storage for parsed attribute
interface ParsedAttributeObject {
	key: string;
	value: string;
	syntax?: string;
}

// Parsed value
type ParsedAttribute = string | ParsedAttributeObject;

// Keys for parser
type Parsers = Attributes | 'onlyHeight';

// Attr
type ParserAttr = Record<string, ParsedAttribute>;

// Callback to get template
type TemplateCallback = (
	attr: string,
	customisations: IconCustomisations
) => string;

// Parser
interface Parser {
	// Function to init parser
	init?: (customisations: IconCustomisations) => ParserAttr;

	// Function to merge data
	merge?: (list: ParserAttr) => string;

	// Template for code sample that uses {attr} variable for list of attributes
	template?: string | TemplateCallback;

	// Vue template
	vueTemplate?: string | TemplateCallback;

	// Parsers for attributes
	parsers: Partial<Record<Parsers, AttributeParser>>;

	// Special parser for icon name
	iconParser?: (list: ParserAttr, valueStr: string, valueIcon: Icon) => void;

	// NPM
	npm?: {
		// Package to install
		install: string;
		// Import code
		import: string | TemplateCallback;
	};

	// Documentation
	docs?: IconifyCodeDocs;
}

/**
 * Convert template to string
 */
function resolveTemplate(
	value: string | TemplateCallback,
	attr: string,
	customisations: IconCustomisations
): string {
	return typeof value === 'string'
		? value.replace('{attr}', attr)
		: value(attr, customisations);
}

/**
 * Generate parsers
 */
function generateParsers(): Record<AvailableLanguages, Parser> {
	/**
	 * Add attributes to parsed attributes
	 */
	function addRawAttr(list: ParserAttr, key: string, value: unknown) {
		list[key] = toString(value);
	}

	function addAttr(list: ParserAttr, key: string, value: string) {
		list[key] = {
			key,
			value,
		};
	}

	function addDynamicAttr(
		list: ParserAttr,
		key: string,
		anyValue: unknown,
		syntax?: string
	) {
		let value: string;
		switch (typeof anyValue) {
			case 'boolean':
				value = anyValue ? 'true' : 'false';
				break;

			case 'object':
				value = JSON.stringify(anyValue);
				break;

			default:
				value = anyValue as string;
		}

		list[key] = {
			key,
			value,
			syntax,
		};
	}

	function addReactAttr(list: ParserAttr, key: string, value: unknown) {
		if (typeof value === 'string' && key !== 'icon') {
			addAttr(list, key, value);
		} else {
			addDynamicAttr(list, key, value, '{var}={{value}}');
		}
	}

	function addVueAttr(list: ParserAttr, key: string, value: unknown) {
		if (typeof value === 'string' && key !== 'icon') {
			addAttr(list, key, value);
		} else {
			addDynamicAttr(list, key, value, ':{var}="{value}"');
		}
	}

	/**
	 * Merge attribute values
	 */
	function mergeAttr(
		list: ParserAttr,
		key: string,
		value: string,
		separator: string
	) {
		const oldItem: ParsedAttributeObject | undefined =
			typeof list[key] === 'object'
				? (list[key] as ParsedAttributeObject)
				: void 0;

		list[key] = {
			key,
			value: (oldItem ? oldItem.value + separator : '') + value,
			syntax: oldItem ? oldItem.syntax : void 0,
		};
	}

	/**
	 * Add functions for multiple attribute parsers
	 */
	function addMultipleAttributeParsers(
		parser: Parser,
		attribs: Attributes[],
		callback: (list: ParserAttr, key: string, value: unknown) => void
	) {
		attribs.forEach((attr) => {
			if (parser.parsers[attr] === void 0) {
				parser.parsers[attr] = (list: ParserAttr, value: unknown) =>
					callback(list, attr, value);
			}
		});
		return parser;
	}

	/**
	 * Merge result
	 */
	function mergeAttributes(list: ParserAttr): string {
		return Object.keys(list)
			.map((key) => {
				const item = list[key];
				if (typeof item === 'object') {
					return (typeof item.syntax === 'string'
						? item.syntax
						: '{var}="{value}"'
					)
						.replace('{var}', item.key)
						.replace('{value}', item.value);
				}
				return item;
			})
			.join(' ');
	}

	/**
	 * Generate all parsers
	 */
	// SVG framework
	const iconifyParser: Parser = {
		init: (customisations) => {
			return {
				class:
					'class="' +
					(customisations.inline ? 'iconify-inline' : 'iconify') +
					'"',
			};
		},
		iconParser: (list, valueStr, valueIcon) =>
			addAttr(list, 'data-icon', valueStr),
		parsers: {
			color: (list, value) =>
				mergeAttr(list, 'style', 'color: ' + value + ';', ' '),
			onlyHeight: (list, value) =>
				mergeAttr(
					list,
					'style',
					'font-size: ' + value + (isNumber(value) ? 'px;' : ';'),
					' '
				),
			width: (list, value) =>
				addAttr(list, 'data-width', toString(value)),
			height: (list, value) =>
				addAttr(list, 'data-height', toString(value)),
			rotate: (list, value) =>
				addAttr(list, 'data-rotate', degrees(value as number)),
			hFlip: (list) => mergeAttr(list, 'data-flip', 'horizontal', ','),
			vFlip: (list) => mergeAttr(list, 'data-flip', 'vertical', ','),
		},
		merge: mergeAttributes,
		template: '<span {attr}></span>',
		docs: {
			type: 'iconify',
			href: docsBase + 'svg-framework/',
		},
	};

	// React
	const reactNPMParser: Parser = {
		iconParser: (list, valueStr, valueIcon) =>
			addReactAttr(list, 'icon', varName(valueIcon.name)),
		parsers: {},
		merge: mergeAttributes,
		template: (attr, customisations) =>
			'<' +
			(customisations.inline ? 'InlineIcon' : 'Icon') +
			' ' +
			attr +
			' />',
		docs: {
			type: 'react',
			href: docsBase + 'react/',
		},
		npm: {
			install: '@iconify/react@beta',
			import: (attr, customisations) =>
				'import { ' +
				(customisations.inline ? 'InlineIcon' : 'Icon') +
				" } from '@iconify/react';",
		},
	};
	const reactAPIParser: Parser = {
		iconParser: (list, valueStr, valueIcon) =>
			addAttr(list, 'icon', valueStr),
		parsers: {},
		merge: mergeAttributes,
		template: reactNPMParser.template,
		docs: {
			type: 'react',
			href: docsBase + 'react-with-api/',
		},
		npm: {
			install: '@iconify/react-with-api',
			import: (attr, customisations) =>
				'import { ' +
				(customisations.inline ? 'InlineIcon' : 'Icon') +
				" } from '@iconify/react-with-api';",
		},
	};

	addMultipleAttributeParsers(
		reactNPMParser,
		colorCustomisationAttributes,
		addReactAttr
	);
	addMultipleAttributeParsers(
		reactAPIParser,
		colorCustomisationAttributes,
		addReactAttr
	);

	// Vue
	const vue2Usage = '<template>\n\t<IconifyIcon {attr} />\n</template>';
	const vue2Template =
		'export default {\n\tcomponents: {\n\t\tIconifyIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\t{varName},\n\t\t\t},\n\t\t};\n\t},\n});';
	const vueParser: Parser = {
		iconParser: (list, valueStr, valueIcon) =>
			addVueAttr(list, 'icon', 'icons.' + varName(valueIcon.name)),
		parsers: {
			hFlip: (list, value) => addVueAttr(list, 'horizontalFlip', value),
			vFlip: (list, value) => addVueAttr(list, 'verticalFlip', value),
		},
		merge: mergeAttributes,
		template: (attr, customisations) =>
			vue2Usage
				.replace(
					/IconifyIcon/g,
					customisations.inline ? 'InlineIcon' : 'Icon'
				)
				.replace('{attr}', attr),
		vueTemplate: (attr, customisations) =>
			vue2Template
				.replace(
					/IconifyIcon/g,
					customisations.inline ? 'InlineIcon' : 'Icon'
				)
				.replace('{attr}', attr),
		docs: {
			type: 'vue',
			href: docsBase + 'vue/',
		},
		npm: {
			install: '@iconify/vue@beta',
			import: (attr, customisations) =>
				'import { ' +
				(customisations.inline ? 'InlineIcon' : 'Icon') +
				" } from '@iconify/vue';",
		},
	};
	addMultipleAttributeParsers(
		vueParser,
		colorCustomisationAttributes,
		addVueAttr
	);

	const vue2Parser: Parser = Object.assign({}, vueParser, {
		docs: {
			type: 'vue',
			href: docsBase + 'vue2/',
		},
		npm: {
			install: '@iconify/vue@^1',
			import: "import IconifyIcon from '@iconify/vue';",
		},
		parsers: Object.assign(
			{
				inline: (list, value) => addVueAttr(list, 'inline', value),
			} as Partial<Record<Parsers, AttributeParser>>,
			vueParser.parsers
		),
		template: vue2Usage,
		vueTemplate: vue2Template,
	});

	// Svelte
	const svelteParser: Parser = {
		iconParser: (list, valueStr, valueIcon) =>
			addReactAttr(list, 'icon', varName(valueIcon.name)),
		parsers: {},
		merge: mergeAttributes,
		template: '<IconifyIcon {attr} />',
		docs: {
			type: 'svelte',
			href: docsBase + 'svelte/',
		},
		npm: {
			install: '@iconify/svelte',
			import: "import IconifyIcon from '@iconify/svelte';",
		},
	};
	addMultipleAttributeParsers(
		svelteParser,
		allCustomisationAttributes,
		addReactAttr
	);

	// SVG
	const svgParser: Parser = {
		parsers: {},
	};
	addMultipleAttributeParsers(
		svgParser,
		inlineCustomisationAttributes,
		addRawAttr
	);

	// Merge all parsers
	const parsers: Record<AvailableLanguages, Parser> = {
		'iconify': iconifyParser,
		'svg-raw': svgParser,
		'svg-box': svgParser,
		'svg-uri': svgParser,
		'react-npm': reactNPMParser,
		'react-api': reactAPIParser,
		'vue2': vue2Parser,
		'vue3': vueParser,
		'svelte': svelteParser,
	};

	return parsers;
}
const parsers = generateParsers();

/**
 * Output
 */
export interface CustomCodeOutput {
	key: string;
	code: string;
}

export interface IconifyCodeOutput {
	// Code to add to <head>
	head: string;

	// HTML code
	html: string;
}

export interface CustomCodeOutputWithText {
	// Text
	text?: string;

	// Code
	code?: string;
}

export interface ComponentCodeOutput {
	install?: string;
	import?: string;
	use: string;

	// Install / import without icon
	install1?: string;
	import1?: string;

	// Vue specific usage
	vue?: string;
}

export const codeOutputComponentKeys: (keyof ComponentCodeOutput)[] = [
	'install',
	'install1',
	'import',
	'import1',
	'vue',
	'use',
];

export interface CodeOutput {
	// Custom header and footer
	header?: CustomCodeOutputWithText;
	footer?: CustomCodeOutputWithText;

	// Iconify
	iconify?: IconifyCodeOutput;

	// Raw code to copy
	raw?: string[];

	// Component
	component?: ComponentCodeOutput;

	// Documentation
	docs?: IconifyCodeDocs;
}

/**
 * Get code for icon
 */
export function getIconCode(
	lang: AvailableLanguages,
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: ProviderCodeData
): CodeOutput | null {
	// Get parts for NPM code
	interface NPMImport {
		name: string;
		package: string;
		file: string;
	}
	function npmIconImport(): NPMImport {
		const name = varName(icon.name);
		return {
			name,
			package: providerConfig.npm!.replace('{prefix}', icon.prefix),
			file: providerConfig.file!.replace('{name}', icon.name),
		};
	}

	if (parsers[lang] === void 0) {
		return null;
	}
	const parser = parsers[lang];

	// Icon as string
	const iconName = iconToString(icon);

	// Init parser
	const attr: ParserAttr = parser.init ? parser.init(customisations) : {};
	const attrParsers = parser.parsers;

	// Add icon name
	if (parser.iconParser) {
		parser.iconParser(attr, iconName, icon);
	}

	// Add color
	if (customisations.color !== '' && attrParsers.color) {
		attrParsers.color(attr, customisations.color);
	}

	// Add dimensions
	if (
		customisations.width === '' &&
		customisations.height !== '' &&
		attrParsers.onlyHeight
	) {
		attrParsers.onlyHeight(attr, customisations.height);
	} else {
		['width', 'height'].forEach((prop) => {
			const key = prop as keyof IconCustomisations;
			if (customisations[key] !== '' && attrParsers[key]) {
				attrParsers[key]!(attr, customisations[key]);
			}
		});
	}

	// Transformations
	['rotate', 'vFlip', 'hFlip'].forEach((prop) => {
		const key = prop as keyof IconCustomisations;
		if (customisations[key] && attrParsers[key]) {
			attrParsers[key]!(attr, customisations[key]);
		}
	});

	// Inline
	if (customisations.inline && attrParsers.inline) {
		attrParsers.inline(attr, true);
	}

	// Merge attributes
	const merged = parser.merge ? parser.merge(attr) : '';

	// Use template
	const html = parser.template
		? resolveTemplate(parser.template, merged, customisations)
		: '';

	// Generate output
	const output: CodeOutput = {
		docs: parser.docs,
	};

	// Add language specific stuff
	let str: string;
	let data: IconifyIcon;
	let npm: NPMImport;
	switch (lang) {
		case 'iconify':
			str = Iconify.getVersion();
			output.iconify = {
				head:
					'<script src="https://code.iconify.design/' +
					str.split('.').shift() +
					'/' +
					str +
					'/iconify.min.js"><' +
					'/script>',
				html,
			};
			break;

		case 'svg-raw':
		case 'svg-box':
		case 'svg-uri':
			str = Iconify.renderHTML(iconName, attr)!;
			if (customisations.color !== '') {
				str = str.replace(/currentColor/g, customisations.color);
			}
			if (lang === 'svg-box') {
				// Add empty rectangle before shapes
				data = Iconify.getIcon(iconName)!;
				str = str.replace(
					'>',
					'><rect x="' +
						data.left +
						'" y="' +
						data.top +
						'" width="' +
						data.width +
						'" height="' +
						data.height +
						'" fill="none" stroke="none" />'
				);
			}
			if (lang === 'svg-uri') {
				// Remove unused attributes
				const parts = str.split('>');
				let firstTag = parts.shift()!;
				['aria-hidden', 'focusable', 'role', 'class', 'style'].forEach(
					(attr) => {
						firstTag = firstTag.replace(
							new RegExp('\\s' + attr + '="[^"]*"'),
							''
						);
					}
				);
				parts.unshift(firstTag);
				str = parts.join('>');

				// Encode
				str =
					"url('data:image/svg+xml," + encodeURIComponent(str) + "')";
			}
			output.raw = [str];
			break;

		case 'react-npm':
		case 'svelte':
		case 'vue2':
		case 'vue3':
			if (!parser.npm || !providerConfig.npm) {
				break;
			}
			npm = npmIconImport();
			output.component = {
				install:
					'npm install --save-dev ' +
					parser.npm.install +
					' ' +
					npm.package,
				import:
					resolveTemplate(parser.npm.import, merged, customisations) +
					'\nimport ' +
					npm.name +
					" from '" +
					npm.package +
					npm.file +
					"';",
				use: html
					.replace(/{varName}/g, npm.name)
					.replace('{iconPackage}', npm.package + npm.file),
			};
			if (typeof parser.vueTemplate === 'string') {
				output.component.vue = parser.vueTemplate
					.replace(/{varName}/g, npm.name)
					.replace('{iconPackage}', npm.package + npm.file);
			}
			break;

		case 'react-api':
			if (!parser.npm) {
				break;
			}
			output.component = {
				install1: 'npm install --save-dev ' + parser.npm.install,
				import1: resolveTemplate(
					parser.npm.import,
					merged,
					customisations
				),
				use: html,
			};
			break;

		default:
			assertNever(lang);
	}

	return output;
}
