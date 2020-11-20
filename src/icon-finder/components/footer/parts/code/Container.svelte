<script lang="typescript">
	import type { FiltersBlock, FullRoute, Icon } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../../wrapper/registry';
	import { phrases } from '../../../../config/phrases';
	import type { ProviderCodeData } from '../../../../footer/types';
	import { codeConfig } from '../../../../config/code';
	import type {
		FilteredCodeTabs,
		FilteredCodeSelection,
		LanguageKeys,
		FakeLanguages,
	} from '../../../../footer/code-tree';
	import { getCodeTree, filterCodeTabs } from '../../../../footer/code-tree';
	import type { IconCustomisations } from '../../../../customisations/types';
	import FooterBlock from '../../misc/Block.svelte';
	import FiltersComponent from '../../../blocks/Filters.svelte';
	import CodeComponent from './Code.svelte';

	// Registry
	export let registry: WrappedRegistry;

	// Selected icon
	export let icon: Icon;

	// Icon customisations
	export let customisations: IconCustomisations;

	const codePhrases = phrases.codeSamples;
	const componentsConfig = registry.config.components;

	// Get list of all code tabs
	let providerConfig: ProviderCodeData;
	let codeTabs: FilteredCodeTabs;
	$: {
		const provider = icon.provider;
		providerConfig =
			codeConfig.providers[provider] === void 0
				? codeConfig.defaultProvider
				: codeConfig.providers[provider];
		codeTabs = getCodeTree(providerConfig, phrases);
	}

	// Selected tab
	let currentTab: LanguageKeys = componentsConfig.codeTab as LanguageKeys;
	let selection: FilteredCodeSelection;
	let childFiltersBlock: FiltersBlock | null;
	let childTabsTitle: string;
	$: {
		selection = filterCodeTabs(codeTabs, currentTab);

		// Update tabs
		const key = selection.root.key as FakeLanguages;
		codeTabs.filters.active = key;
		if (
			selection.child &&
			(codeTabs.childFilters as Record<string, unknown>)[key]
		) {
			// Child tab: update active tab and get title
			childFiltersBlock = (codeTabs.childFilters as Record<
				string,
				unknown
			>)[key] as FiltersBlock;
			childFiltersBlock.active = selection.child.key;
			childTabsTitle =
				codePhrases.childTabTitles[key] === void 0
					? codePhrases.childTabTitle.replace('{key}', key)
					: codePhrases.childTabTitles[key]!;
		} else {
			childFiltersBlock = null;
			childTabsTitle = '';
		}
	}

	// Change current tab
	function changeTab(tab: string) {
		componentsConfig.codeTab = tab;
		currentTab = tab as LanguageKeys;

		// UIConfigEvent
		registry.callback({
			type: 'config',
		});
	}
</script>

{#if codeTabs.tree.length}
	<FooterBlock
		name="code"
		{registry}
		title={codePhrases.heading.replace('{name}', icon.name)}>
		<div class="iif-code">
			<div class="iif-filters">
				<FiltersComponent
					{registry}
					name="code"
					block={codeTabs.filters}
					onClick={changeTab} />
				{#if childFiltersBlock}
					<FiltersComponent
						{registry}
						name="code"
						block={childFiltersBlock}
						onClick={changeTab}
						title={childTabsTitle} />
				{/if}
			</div>

			<CodeComponent
				{registry}
				mode={selection.active.key}
				{icon}
				{customisations}
				{providerConfig} />
		</div>
	</FooterBlock>
{/if}
