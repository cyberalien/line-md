<script lang="typescript">
	import type { CollectionInfo } from '@iconify/search-core/lib/converters/collection';
	import Item from './Item.svelte';

	// Show categories
	export let showCategories: boolean;

	// Category title
	export let category: string = '';

	// Items
	export let items: Record<string, CollectionInfo>;

	// API provider
	export let provider: string;

	// Callback for click
	export let onClick: (prefix: string) => void;
</script>

<div class="iif-collections-list-category">
	{#if showCategories}
		<div class="iif-collections-list-title">{category}</div>
	{/if}
	<ul class="iif-collections-list-items">
		{#each Object.entries(items) as [prefix, info], i (prefix)}
			<Item {provider} {prefix} {info} {onClick} />
		{/each}
	</ul>
</div>
