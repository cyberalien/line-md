<script lang="typescript">
	import { getContext } from 'svelte';
	import type {
		CollectionViewBlocks,
		PaginationBlock,
		FullRoute,
		ViewBlocks,
	} from '@iconify/search-core';
	import type { SelectedIcons } from '../../../wrapper/icons';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { phrases } from '../../../config/phrases';
	import ContentError from '../../ui/ContentError.svelte';
	import Block from '../Block.svelte';
	import IconsContainer from './icons/Container.svelte';
	import IconsHeader from './icons/Header.svelte';
	import Pagination from './Pagination.svelte';

	// Current route
	export let route: FullRoute;

	// Selected icons
	export let selection: SelectedIcons;

	// Blocks
	export let blocks: ViewBlocks;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Get config
	const componentsConfig = registry.config.components;

	// Get pagination
	let pagination: PaginationBlock;
	$: {
		pagination = (blocks as CollectionViewBlocks).pagination;
	}

	// Generate header text
	function generateHeaderText() {
		// const pagination = blocks.pagination as ;
		const total = pagination.length,
			text = phrases.icons;

		if (pagination.more && total > 0) {
			// Search results with "more" button
			return text.header.full;
		}

		// Exact phrase for count
		if (text.headerWithCount[total] !== void 0) {
			return text.headerWithCount[total];
		}

		// Default
		return text.header.full;
	}

	// Check if block is empty and get header text
	let isEmpty: boolean;
	let headerText: string;
	$: {
		isEmpty =
			!pagination ||
			!(blocks as CollectionViewBlocks).icons ||
			(blocks as CollectionViewBlocks).icons.icons.length < 1;
		if (!isEmpty) {
			// Generate header text
			headerText = generateHeaderText().replace(
				'{count}',
				pagination.length + ''
			);
		}
	}

	// Layout mode
	const canChangeLayout = componentsConfig.toggleList;
	let isList = componentsConfig.list;

	function changeLayout() {
		if (canChangeLayout) {
			isList = componentsConfig.list = !componentsConfig.list;
			// UIConfigEvent
			registry.callback({
				type: 'config',
			});
		}
	}

	// Select multiple icons
	const canSelectMultiple = componentsConfig.multiSelect;
	let isSelecting: boolean = false;

	function toggleSelection() {
		isSelecting = !isSelecting;
	}
</script>

{#if isEmpty}
	<ContentError error={phrases.errors.noIconsFound} />
{:else}
	<Block type="icons">
		<IconsHeader
			{headerText}
			{isList}
			{canChangeLayout}
			{changeLayout}
			{canSelectMultiple}
			{isSelecting}
			{toggleSelection} />
		<IconsContainer {selection} {blocks} {route} {isList} {isSelecting} />
		<Pagination name="pagination" block={pagination} />
	</Block>
{/if}
