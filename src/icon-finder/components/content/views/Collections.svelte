<script lang="typescript">
	import type {
		CollectionsViewBlocks,
		FullCollectionsRoute,
	} from '@iconify/search-core';
	import FiltersBlock from '../blocks/Filters.svelte';
	import CollectionsFilterBlock from '../blocks/CollectionsFilter.svelte';
	import CollectionsListBlock from '../blocks/CollectionsList.svelte';

	// Blocks
	export let blocks: CollectionsViewBlocks;

	// Route
	export let route: FullCollectionsRoute;
</script>

<div class="iif-view iif-view--collections">
	<div class="iif-collections-header">
		{#if blocks.categories}
			<FiltersBlock name="categories" block={blocks.categories} />
		{/if}
		<CollectionsFilterBlock name="filter" block={blocks.filter} />
	</div>
	<CollectionsListBlock
		provider={route.params.provider}
		name="collections"
		block={blocks.collections} />
</div>
