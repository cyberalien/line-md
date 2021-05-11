<script lang="typescript">
	import { getContext } from 'svelte';
	import type { CollectionsFilterBlock } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { phrases } from '../../../config/phrases';
	import Block from '../Block.svelte';
	import Input from '../../ui/Input.svelte';

	// Block name
	export let name: string;

	// Block data
	export let block: CollectionsFilterBlock;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

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
