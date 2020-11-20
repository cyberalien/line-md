<script lang="typescript">
	import { getContext } from 'svelte';
	import type { CollectionInfo, SearchBlock } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import { phrases } from '../../config/phrases';
	import { canFocusSearch } from '../../config/components';
	import Input from '../forms/Input.svelte';
	import Block from './Block.svelte';

	// Block name
	export let name: string;

	// Block data
	export let block: SearchBlock;

	// Collection info when searching collection
	export let info: CollectionInfo | null = null;

	// Custom view type when searching custom view
	export let customType: string = '';

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Phrases
	const searchPhrases = phrases.search;

	// Get placeholder
	let placeholder: string;
	$: {
		if (
			customType !== '' &&
			searchPhrases.placeholder[customType] !== void 0
		) {
			placeholder = searchPhrases.placeholder[customType];
		} else if (
			info &&
			info.name &&
			searchPhrases.placeholder.collection !== void 0
		) {
			placeholder = searchPhrases.placeholder.collection.replace(
				'{name}',
				info.name
			);
		} else {
			placeholder = searchPhrases.defaultPlaceholder;
		}
	}

	// Submit form
	function changeValue(value: string) {
		registry.router.action(name, value.trim().toLowerCase());
	}
</script>

<Block type="search" {name} extra="search-form">
	<Input
		type="text"
		value={block.keyword}
		onInput={changeValue}
		{placeholder}
		icon="search"
		autofocus={canFocusSearch} />
	<!-- <button class="iif-form-button iif-form-button--secondary">
		{searchPhrases.button}
	</button> -->
</Block>
