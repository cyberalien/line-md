<script lang="typescript">
	import type {
		CollectionViewBlocks,
		FullCustomRoute,
	} from '@iconify/search-core';
	import type { SelectedIcons } from '../../wrapper/icons';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';
	import SearchBlock from '../blocks/Search.svelte';

	// Registry
	export let registry: WrappedRegistry;

	// Route
	export let route: FullCustomRoute;

	// Selected icons
	export let selection: SelectedIcons;
	export let selectionLength: number;

	// Blocks
	export let blocks: CollectionViewBlocks;
</script>

<div
	class="iif-view iif-view--custom iif-view--custom--{route.params.customType}">
	<SearchBlock
		{registry}
		name="filter"
		block={blocks.filter}
		customType={route.params.customType} />
	<IconsWithPages {registry} {blocks} {selection} {selectionLength} {route} />
</div>
