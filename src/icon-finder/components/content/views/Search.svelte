<script lang="typescript">
	import type {
		FullSearchRoute,
		SearchViewBlocks,
	} from '@iconify/search-core';
	import { getProvider } from '@iconify/search-core';
	import type { SelectedIcons } from '../../../wrapper/icons';
	import FiltersBlock from '../blocks/Filters.svelte';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';

	// Route
	export let route: FullSearchRoute;

	// Selected icons
	export let selection: SelectedIcons;

	// Blocks
	export let blocks: SearchViewBlocks;

	// Get collection link
	let collectionsLink: string;
	$: {
		let provider = route.params.provider;
		if (typeof provider !== 'string') {
			provider = '';
		}

		// Get collection link
		const providerData = getProvider(provider);
		if (providerData) {
			collectionsLink = providerData.links.collection;
		} else {
			collectionsLink = '';
		}
	}
</script>

<div class="iif-view iif-view--search">
	{#if blocks.collections}
		<FiltersBlock
			name="collections"
			block={blocks.collections}
			link={collectionsLink} />
	{/if}

	<IconsWithPages {blocks} {selection} {route} />
</div>
