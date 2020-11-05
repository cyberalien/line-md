import type {
	FiltersBlock,
	FiltersFilter,
} from '@iconify/search-core/lib/blocks/filters';
import { autoIndexFilters } from '@iconify/search-core/lib/blocks/filters';
import type { UITranslation } from '../phrases/types';
import { capitalize } from './capitalize';
import type { ProviderCodeData } from './types';

/**
 * Available code languages
 */
export type AvailableLanguages =
	// SVG framework
	| 'iconify'
	// Raw SVG
	| 'svg-raw'
	| 'svg-box'
	| 'svg-uri'
	// React
	| 'react-npm'
	| 'react-api'
	// Vue
	| 'vue2'
	| 'vue3'
	// Svelte
	| 'svelte';

// Tabs that do not generate code
export type FakeLanguages = 'react' | 'vue' | 'svg';

export type LanguageKeys = AvailableLanguages | FakeLanguages;

/**
 * Modes for code tabs
 *
 * Raw mode for tabs that generate result from icon data
 */
type CodeComponentMode = 'iconify' | 'npm' | 'raw';

/**
 * Languages list, unfiltered
 */
interface UnfilteredLanguagesMapChild {
	lang: AvailableLanguages;
	mode?: CodeComponentMode;
}

interface UnfilteredLanguagesMapTab {
	tab: FakeLanguages;
	mode?: CodeComponentMode;
	children: UnfilteredLanguagesMapChild[];
}

type UnfilteredLanguagesMapRoot =
	| UnfilteredLanguagesMapChild
	| UnfilteredLanguagesMapTab;

/**
 * Raw code tabs
 */
const rawCodeTabs: UnfilteredLanguagesMapRoot[] = [
	{
		lang: 'iconify',
		mode: 'iconify',
	},
	{
		tab: 'svg',
		mode: 'raw',
		children: [
			{
				lang: 'svg-raw',
			},
			{
				lang: 'svg-box',
			},
			{
				lang: 'svg-uri',
			},
		],
	},
	{
		tab: 'react',
		children: [
			{
				lang: 'react-npm',
				mode: 'npm',
			},
			{
				lang: 'react-api',
				mode: 'iconify',
			},
		],
	},
	{
		tab: 'vue',
		mode: 'npm',
		children: [
			{
				lang: 'vue3',
			},
			{
				lang: 'vue2',
			},
		],
	},
	{
		lang: 'svelte',
		mode: 'npm',
	},
];

/**
 * Tabs list, filtered
 */
export interface FilteredLanguageMapChild {
	lang: AvailableLanguages;
	title: string;
}

export interface FilteredLanguageMapTab {
	tab: FakeLanguages;
	title: string;
	children: FilteredLanguageMapChild[];
}

export type FilteredLanguageMap =
	| FilteredLanguageMapTab
	| FilteredLanguageMapChild;

export interface FilteredCodeTabs {
	// Tabs tree
	tree: FilteredLanguageMap[];

	// List of aliases
	aliases: Record<FakeLanguages, AvailableLanguages>;

	// Tabs
	filters: FiltersBlock;
	childFilters: Record<FakeLanguages, FiltersBlock>;
}

/**
 * Get code tree
 */
export function getCodeTree(
	config: ProviderCodeData,
	phrases: UITranslation
): FilteredCodeTabs {
	const modes: Record<CodeComponentMode, boolean> = {
		raw: true,
		iconify: config.iconify,
		npm: !!config.npm,
	};
	const result: FilteredCodeTabs = {
		tree: [],
		aliases: Object.create(null),
		filters: {
			type: 'filters',
			filterType: 'code-tabs',
			active: '',
			filters: Object.create(null),
		},
		childFilters: Object.create(null),
	};

	rawCodeTabs.forEach((sourceItem) => {
		if (sourceItem.mode && !modes[sourceItem.mode]) {
			// Root item is disabled
			return;
		}

		// Item without child items
		if (
			typeof (sourceItem as UnfilteredLanguagesMapChild).lang === 'string'
		) {
			const lang = (sourceItem as UnfilteredLanguagesMapChild).lang;
			const title = getCodeTitle(phrases, lang);
			result.tree.push({
				lang,
				title,
			});
			result.filters.filters[lang] = {
				title,
			};

			return;
		}

		// Test child items
		const sourceTab = sourceItem as UnfilteredLanguagesMapTab;
		const tab = sourceTab.tab;

		// Test child items
		const children: FilteredLanguageMapChild[] = [];
		sourceTab.children.forEach((childItem) => {
			if (childItem.mode && !modes[childItem.mode]) {
				return;
			}
			const lang = childItem.lang;
			children.push({
				lang,
				title: getCodeTitle(phrases, lang),
			});
		});

		let title: string;
		let filters: Record<string, FiltersFilter>;
		let lang: AvailableLanguages;
		switch (children.length) {
			case 0:
				return;

			case 1:
				// Move child item to root, use title from parent item
				title = getCodeTitle(phrases, tab);
				lang = children[0].lang;
				result.tree.push({
					lang,
					title,
				});
				result.filters.filters[lang] = {
					title,
				};
				result.aliases[tab] = lang;
				break;

			default:
				title = getCodeTitle(phrases, tab);
				result.tree.push({
					tab,
					title,
					children,
				});
				result.filters.filters[tab] = {
					title,
				};

				// Create filters block
				filters = Object.create(null);
				result.childFilters[tab] = {
					type: 'filters',
					filterType: 'code-tabs',
					active: '',
					filters,
				};
				children.forEach((item) => {
					filters[item.lang] = {
						title: item.title,
					};
				});
				autoIndexFilters(result.childFilters[tab]);
		}
	});

	autoIndexFilters(result.filters);

	return result;
}

/**
 * Interface for filtered data
 */
export interface FilteredCodeSelection {
	// Active language
	active: {
		key: AvailableLanguages;
		title: string;
	};

	// Root tab
	root: {
		key: LanguageKeys;
		title: string;
	};

	// Child tab
	child?: {
		key: AvailableLanguages;
		title: string;
	};
}

/**
 * Filter code tabs
 */
export function filterCodeTabs(
	codeTabs: FilteredCodeTabs,
	selected: LanguageKeys
): FilteredCodeSelection {
	const result = {} as FilteredCodeSelection;

	let found = false;
	let selected2: undefined | AvailableLanguages =
		codeTabs.aliases[selected as FakeLanguages];

	// Check tree for matches
	for (let i = 0; i < codeTabs.tree.length; i++) {
		const tab = codeTabs.tree[i];
		if (typeof (tab as FilteredLanguageMapChild).lang === 'string') {
			// Tab for language
			const langTab = tab as FilteredLanguageMapChild;
			const key = langTab.lang;
			if (key === selected || key === selected2) {
				// Found match
				found = true;
				result.active = {
					key,
					title: tab.title,
				};
				result.root = result.active;
				break;
			}
		} else {
			// Tab with child items
			const tabTab = tab as FilteredLanguageMapTab;
			const key = tabTab.tab;
			if (key === selected) {
				// Tab matched: use first child
				selected = tabTab.children[0].lang;
			}

			// Test child items
			for (let j = 0; j < tabTab.children.length; j++) {
				const childTab = tabTab.children[j];
				const lang = childTab.lang;
				if (lang === selected || lang === selected2) {
					// Child matched
					found = true;
					result.active = {
						key: lang,
						title: childTab.title,
					};
					result.child = result.active;
					result.root = {
						key,
						title: tabTab.title,
					};
					break;
				}
			}
		}

		if (found) {
			break;
		}
	}

	// Not found? Use first tab
	if (!found) {
		const firstTab = codeTabs.tree[0];
		if (typeof (firstTab as FilteredLanguageMapChild).lang === 'string') {
			const childTab = firstTab as FilteredLanguageMapChild;
			// Tab without child item
			result.active = {
				key: childTab.lang,
				title: childTab.title,
			};
			result.root = result.active;
		} else {
			// Tab with child item
			const parentTab = firstTab as FilteredLanguageMapTab;
			const childTab = parentTab.children[0];
			result.active = {
				key: childTab.lang,
				title: childTab.title,
			};
			result.root = {
				key: parentTab.tab,
				title: parentTab.title,
			};
			result.child = result.active;
		}
	}

	return result;
}

/**
 * Get title for code block
 */
export function getCodeTitle(
	phrases: UITranslation,
	key: LanguageKeys
): string {
	const titles = phrases.codeSamples.titles;
	return titles[key] === void 0 ? capitalize(key) : titles[key]!;
}
