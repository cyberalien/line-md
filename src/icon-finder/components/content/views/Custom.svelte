<script lang="typescript">
	import type {
		CollectionViewBlocks,
		FullCustomRoute,
	} from '@iconify/search-core';
	import type { SelectedIcons } from '../../../wrapper/icons';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';
	import SearchBlock from '../blocks/Search.svelte';

	// Route
	export let route: FullCustomRoute;

	// Selected icons
	export let selection: SelectedIcons;

	// Blocks
	export let blocks: CollectionViewBlocks;
</script>

<div
	class="iif-view iif-view--custom iif-view--custom--{route.params.customType}">
	<SearchBlock
		name="filter"
		block={blocks.filter}
		customType={route.params.customType} />
	<IconsWithPages {blocks} {selection} {route} />
</div>
