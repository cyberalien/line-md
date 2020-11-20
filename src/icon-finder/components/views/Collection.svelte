<script lang="typescript">
	import type {
		CollectionViewBlocks,
		FullCollectionRoute,
		CollectionInfo,
		FiltersBlock,
	} from '@iconify/search-core';
	import { getProvider } from '@iconify/search-core';
	import type { SelectedIcons } from '../../wrapper/icons';
	import { showCollectionInfoBlock } from '../../config/components';
	import Filters from '../blocks/Filters.svelte';
	import CollectionInfoBlock from '../blocks/CollectionInfo.svelte';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';
	import SearchBlock from '../blocks/Search.svelte';

	// Selected icons
	export let selection: SelectedIcons;

	// Blocks
	export let blocks: CollectionViewBlocks;

	// Current route
	export let route: FullCollectionRoute;

	// Filter blocks
	const filterBlockKeys: (keyof CollectionViewBlocks)[] = [
		'tags',
		'themePrefixes',
		'themeSuffixes',
	];
	const baseClass = 'iif-view--collection';

	// Provider and prefix from route
	let provider: string;
	let prefix: string;

	// Collection info
	let info: CollectionInfo | null;

	// Collection link
	let collectionsLink: string;

	$: {
		provider = route.params.provider;
		if (typeof provider !== 'string') {
			provider = '';
		}
		prefix = route.params.prefix;
		info = blocks.info === null ? null : blocks.info.info;

		// Get collection link
		const providerData = getProvider(provider);
		if (providerData) {
			collectionsLink = providerData.links.collection;
		} else {
			collectionsLink = '';
		}
	}

	// Check for filters
	interface FiltersListItem {
		key: string;
		item: FiltersBlock;
	}
	let filterBlocks: FiltersListItem[];
	$: {
		filterBlocks = filterBlockKeys
			.filter((key) => !!blocks[key])
			.map((key) => {
				return {
					key,
					item: (blocks[key] as unknown) as FiltersBlock,
				} as FiltersListItem;
			});
	}
</script>

<div
	class="iif-view {baseClass}
		{baseClass}--prefix--{prefix + (provider === '' ? '' : ' ' + baseClass + '--provider--' + provider)}">
	{#if blocks.collections}
		<div class="iff-filters">
			<Filters
				name="collections"
				parent={route.parent ? route.parent.type : 'collections'}
				link={collectionsLink}
				block={blocks.collections} />
		</div>
	{/if}

	{#if showCollectionInfoBlock && info !== null}
		<CollectionInfoBlock name="info" block={blocks.info} />
	{/if}

	<SearchBlock name="filter" block={blocks.filter} {info} />

	{#if filterBlocks.length > 0}
		<div class="iff-filters">
			{#each filterBlocks as item, i (item.key)}
				<Filters name={item.key} block={item.item} />
			{/each}
		</div>
	{/if}

	<IconsWithPages {blocks} {selection} {route} />
</div>
