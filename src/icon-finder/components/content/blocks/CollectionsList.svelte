<script lang="typescript">
	import { getContext } from 'svelte';
	import type { CollectionsListBlock } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { phrases } from '../../../config/phrases';
	import Block from '../Block.svelte';
	import Category from './collections-list/Category.svelte';
	import Error from '../../ui/ContentError.svelte';

	// Block name
	export let name: string;

	// Block data
	export let block: CollectionsListBlock;

	// API propvider
	export let provider: string;

	// Get registry instance
	const registry = getContext('registry') as WrappedRegistry;

	// Click event
	function onClick(prefix: string) {
		registry.router.action(name, prefix);
	}
</script>

<Block type="collections">
	{#each Object.entries(block.collections.visible) as [category, items], i (category)}
		<Category
			{onClick}
			showCategories={block.showCategories}
			{category}
			{provider}
			{items} />
	{:else}
		<Error error={phrases.errors.noCollections} />
	{/each}
</Block>
