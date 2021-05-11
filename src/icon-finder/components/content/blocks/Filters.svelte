<script lang="typescript">
	import { getContext } from 'svelte';
	import type { FiltersBlock } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { phrases } from '../../../config/phrases';
	import Block from '../Block.svelte';
	import Filter from '../../ui/Filter.svelte';

	// Block name
	export let name: string;

	// Block data
	export let block: FiltersBlock;

	// Parent route type
	export let parent: string = '';

	// Link for items, use {prefix} for item key
	export let link: string = '';

	// Click handler
	export let onClick: ((key: string) => void) | null = null;

	// Show title?
	export let showTitle: boolean = false;

	// Title
	export let title: string = '';

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Handle click
	function handleClick(key: string) {
		if (typeof onClick === 'function') {
			onClick(key);
		} else {
			registry.router.action(name, key === block.active ? null : key);
		}
	}

	// Resolve header
	let header: string;
	$: {
		if (showTitle === false) {
			header = '';
		} else if (typeof title === 'string') {
			header = title;
		} else {
			let key = name;
			if (parent !== '') {
				if (phrases.filters[name + '-' + parent] !== void 0) {
					key = name + '-' + parent;
				}
			}
			header =
				phrases.filters[key] === void 0 ? '' : phrases.filters[key];
		}
	}

	// Get filter keys
	let filters: string[];
	$: {
		filters = block === null ? [] : Object.keys(block.filters);
	}

	// Get extra class name
	let extra: string;
	$: {
		extra =
			block === null || block.active === null ? '' : 'filters--active';
	}
</script>

{#if filters.length > 1}
	<Block type="filters" {name} {extra}>
		{#if header !== ''}
			<div class="iif-filters-header">{header}</div>
		{/if}
		<div class="iif-filters-list">
			{#each Object.entries(block.filters) as [key, filter], i (key)}
				<Filter
					active={key === block.active}
					hasActive={block.active !== null}
					{filter}
					link={link ? link.replace('{prefix}', key) : void 0}
					title={filter.title === '' ? phrases.filters.uncategorised : filter.title}
					onClick={() => handleClick(key)} />
			{/each}
		</div>
	</Block>
{/if}
