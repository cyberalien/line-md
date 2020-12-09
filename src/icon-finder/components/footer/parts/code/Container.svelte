<script lang="typescript">
	import { getContext } from 'svelte';
	import type { FiltersBlock, Icon } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type {
		CodeSampleAPIConfig,
		CodeSampleKey,
	} from '@iconify/search-core/lib/code-samples/types';
	import type {
		CodeSamplesTree,
		CodeSamplesTreeItem,
		CodeSamplesTreeChildItem,
	} from '@iconify/search-core/lib/code-samples/tree';
	import { getCodeSamplesTree } from '@iconify/search-core/lib/code-samples/tree';
	import type { WrappedRegistry } from '../../../../wrapper/registry';
	import { phrases } from '../../../../config/phrases';
	import { codeConfig } from '../../../../config/code';
	import FooterBlock from '../../misc/Block.svelte';
	import FiltersComponent from '../../../blocks/Filters.svelte';
	import CodeComponent from './Code.svelte';

	// Selected icon
	export let icon: Icon;

	// Icon customisations
	export let customisations: IconCustomisations;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	const codePhrases = phrases.codeSamples;
	const componentsConfig = registry.config.components;

	// Internal types
	type CurrentTab = CodeSampleKey | '';

	interface CurrentTabData {
		tab: CurrentTab;
		parent: CodeSamplesTreeItem | null;
		parentIndex: number;
		child: CodeSamplesTreeChildItem | null;
	}

	interface DataCache {
		lastProvider: string | null;
		lastParent: CodeSamplesTreeItem | null;
		lastChild: CodeSamplesTreeChildItem | null;
	}

	interface ProviderCache {
		config: CodeSampleAPIConfig;
		tree: CodeSamplesTree;
	}

	// Cache
	const providerCache: Record<string, ProviderCache> = Object.create(null);
	const data: DataCache = {
		lastProvider: null,
		lastParent: null,
		lastChild: null,
	};

	// Currently selected tab
	let currentTab: CurrentTab;

	// Filters
	let parentFilters: FiltersBlock | null = null;
	let childFilters: FiltersBlock | null = null;
	let childTabsTitle: string = '';

	// API provider for current icon
	$: {
		const provider = icon.provider;
		if (provider !== data.lastProvider) {
			// Changed API provider
			data.lastProvider = provider;
			getProviderData(provider);

			// Get current tab
			let tab = (typeof currentTab !== 'string'
				? componentsConfig.codeTab
				: currentTab) as CurrentTab;

			// Update current tab
			updateCurrentTab(checkCurrentTab(tab, true));
		}
	}

	/**
	 * Get data for provider
	 */
	function getProviderData(provider: string): ProviderCache {
		if (providerCache[provider] === void 0) {
			// Update cached data
			const config =
				codeConfig.providers[provider] === void 0
					? codeConfig.defaultProvider
					: codeConfig.providers[provider];
			providerCache[provider] = {
				config,
				tree: getCodeSamplesTree(config),
			};
		}
		return providerCache[provider];
	}

	/**
	 * Update current tab
	 */
	function updateCurrentTab(item: CurrentTabData) {
		function createFilters(
			items: CodeSamplesTree,
			active: CodeSampleKey,
			startIndex = 0
		): FiltersBlock | null {
			if (items.length < 2) {
				return null;
			}

			const block: FiltersBlock = {
				type: 'filters',
				filterType: 'code-tabs',
				active,
				filters: Object.create(null),
			};

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				const key = item.tab ? item.tab : item.mode!;
				block.filters[key] = {
					title: item.title,
					index: i + startIndex,
				};
			}

			return block;
		}

		const tab = item.tab;
		if (currentTab !== tab) {
			// Change tab
			currentTab = componentsConfig.codeTab = tab;

			// UIConfigEvent
			registry.callback({
				type: 'config',
			});
		} else if (
			data.lastParent === item.parent &&
			data.lastParent === item.child
		) {
			// Nothing to change
			return;
		}

		if (tab === '') {
			// Nothing to display
			parentFilters = childFilters = data.lastChild = data.lastParent = null;
			return;
		}

		// Update filters
		const providerData = getProviderData(icon.provider);
		const tree = providerData.tree;
		const parent = item.parent!; // Cannot be empty
		const child = item.child;
		if (data.lastParent === parent) {
			// Only change active tab
			if (parentFilters) {
				parentFilters.active = parent.tab ? parent.tab : parent.mode!;
			}
		} else {
			// Create new filters
			parentFilters = createFilters(
				tree,
				parent.tab ? parent.tab : parent.mode!
			);
		}

		// Child filters
		if (data.lastChild === child) {
			// Only change active tab
			if (childFilters) {
				childFilters.active = child!.mode;
			}
		} else {
			// Create new child filters
			childFilters = child
				? createFilters(
						parent.children!,
						child!.mode,
						item.parentIndex + 1
				  )
				: null;
		}

		// Update text
		if (childFilters && parentFilters) {
			const key = parent.tab!;
			childTabsTitle =
				codePhrases.childTabTitles[key] === void 0
					? codePhrases.childTabTitle.replace('{key}', key)
					: codePhrases.childTabTitles[key]!;
		} else {
			childTabsTitle = '';
		}

		// Store last items to avoid re-rendering if items do not change
		data.lastParent = parent;
		data.lastChild = child;
	}

	/**
	 * Check currentTab, return new value
	 */
	function checkCurrentTab(
		tab: CurrentTab,
		useDefault: boolean
	): CurrentTabData {
		const providerData = getProviderData(icon.provider);
		const tree = providerData.tree;

		if (typeof tab === 'string') {
			for (
				let parentIndex = 0;
				parentIndex < tree.length;
				parentIndex++
			) {
				const parent = tree[parentIndex];
				if (parent.mode === tab || parent.tab === tab) {
					if (parent.children) {
						// Has children: return first child
						const child = parent.children[0];
						return {
							tab: child.mode,
							parent,
							parentIndex,
							child,
						};
					}

					// No children, must have mode
					return {
						tab: parent.mode!,
						parent,
						parentIndex,
						child: null,
					};
				}

				// Check children
				if (parent.children) {
					for (let j = 0; j < parent.children.length; j++) {
						const child = parent.children[j];
						if (child.mode === tab) {
							return {
								tab,
								parent,
								parentIndex,
								child,
							};
						}
					}
				}
			}
		}

		// No match: use first item
		if (useDefault) {
			const parent = tree[0];
			if (!parent) {
				// No modes available
				return {
					tab: '',
					parent: null,
					parentIndex: 0,
					child: null,
				};
			}
			if (parent.children) {
				// Has child items: use first item
				const child = parent.children[0];
				return {
					tab: child.mode,
					parent,
					parentIndex: 0,
					child,
				};
			}
			// Tab without children
			return {
				tab: parent.mode!, // Must have mode
				parent,
				parentIndex: 0,
				child: null,
			};
		}

		return {
			tab: '',
			parent: null,
			parentIndex: 0,
			child: null,
		};
	}

	// Change current tab
	function changeTab(tab: string) {
		const item = checkCurrentTab(tab as CurrentTab, false);
		if (item.tab === currentTab || (item.tab === '' && currentTab !== '')) {
			// Do not change tab if it wasn't changed or if it doesn't exist
			return;
		}

		updateCurrentTab(item);
	}
</script>

{#if currentTab}
	<FooterBlock
		name="code"
		title={codePhrases.heading.replace('{name}', icon.name)}>
		<div class="iif-code">
			<div class="iif-filters">
				{#if parentFilters}
					<FiltersComponent
						name="code"
						block={parentFilters}
						onClick={changeTab} />
				{/if}
				{#if childFilters}
					<FiltersComponent
						name="code"
						block={childFilters}
						onClick={changeTab}
						title={childTabsTitle} />
				{/if}
			</div>

			<CodeComponent
				mode={currentTab}
				{icon}
				{customisations}
				providerConfig={getProviderData(icon.provider).config} />
		</div>
	</FooterBlock>
{/if}
