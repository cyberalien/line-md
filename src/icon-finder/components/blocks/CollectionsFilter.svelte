<script lang="typescript">
	import type { CollectionsFilterBlock } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import { phrases } from '../../config/phrases';
	import Block from './Block.svelte';
	import Input from '../forms/Input.svelte';

	// Global registry to get Router instance from
	export let registry: WrappedRegistry;

	// Block name
	export let name: string;

	// Block data
	export let block: CollectionsFilterBlock;

	// Set initial input value
	let value: string = block.keyword;
	$: {
		// Update value
		if (value !== block.keyword) {
			registry.router.action(name, value);
		}
	}

	// Get placeholder
	const text = phrases.search;
	const placeholder =
		text.placeholder.collections === void 0
			? text.defaultPlaceholder
			: text.placeholder.collections;
</script>

<Block type="filter">
	<Input type="text" bind:value icon="search" {placeholder} />
</Block>
