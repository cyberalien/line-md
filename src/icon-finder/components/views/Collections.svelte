<script lang="typescript">
	import type {
		CollectionsViewBlocks,
		FullCollectionsRoute,
	} from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import FiltersBlock from '../blocks/Filters.svelte';
	import CollectionsFilterBlock from '../blocks/CollectionsFilter.svelte';
	import CollectionsListBlock from '../blocks/CollectionsList.svelte';

	// Registry
	export let registry: WrappedRegistry;

	// Blocks
	export let blocks: CollectionsViewBlocks;

	// Route
	export let route: FullCollectionsRoute;
</script>

<div class="iif-view iif-view--collections">
	<div class="iif-collections-header">
		{#if blocks.categories}
			<FiltersBlock
				{registry}
				name="categories"
				block={blocks.categories} />
		{/if}
		<CollectionsFilterBlock
			{registry}
			name="filter"
			block={blocks.filter} />
	</div>
	<CollectionsListBlock
		{registry}
		provider={route.params.provider}
		name="collections"
		block={blocks.collections} />
</div>
