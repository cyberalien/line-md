<script lang="typescript">
	import { getContext } from 'svelte';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { phrases } from '../../../config/phrases';
	import type { PaginationBlock } from '@iconify/search-core';
	import { showPagination } from '@iconify/search-core';
	import UIIcon from '../../ui/UIIcon.svelte';

	// Block name
	export let name: string;

	// Block data
	export let block: PaginationBlock;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Class names
	const baseClass = 'iif-page';
	const selectedClass = baseClass + ' ' + baseClass + '--selected';
	const arrowClass =
		baseClass + ' ' + baseClass + '--arrow ' + baseClass + '--';
	const moreClass = baseClass + ' ' + baseClass + '--more';

	// Get pages
	interface Page {
		selected: boolean;
		dot: boolean;
		page: number;
		text: string;
		className: string;
		onClick: () => void;
	}

	let pages: Page[] = [];
	let prevPage: number;
	let nextPage: number;
	$: {
		const visiblePages = showPagination(block);
		if (visiblePages.length) {
			// Get previous / next pages
			nextPage = block.more
				? block.page + 1
				: visiblePages[visiblePages.length - 1] > block.page
				? block.page + 1
				: -1;
			prevPage = block.page > 0 ? block.page - 1 : -1;

			// Map pages
			pages = visiblePages.map((page, index) => {
				const dot = index > 0 && visiblePages[index - 1] < page - 1;
				const selected = page === block.page;
				const result: Page = {
					selected,
					dot,
					page,
					text: page + 1 + '',
					className: selected ? selectedClass : baseClass,
					onClick: () => setPage(page),
				};
				return result;
			});
		} else if (pages.length) {
			// Reset
			pages = [];
			prevPage = -1;
			nextPage = -1;
		}
	}

	// Change page
	function setPage(page: number | string) {
		registry.router.action(name, page);
	}
</script>

{#if pages.length > 0}
	<div class="iif-pagination">
		{#if prevPage !== -1}
			<a
				href="# "
				class={arrowClass + 'prev'}
				title={phrases.pagination.prev}
				on:click|preventDefault={() => setPage(prevPage)}>
				<UIIcon icon="left">&lt;</UIIcon>
			</a>
		{/if}
		{#each pages as page, i (page.page)}
			{#if page.dot}<span>...</span>{/if}
			<a
				href={page.selected ? void 0 : '# '}
				class={page.className}
				on:click|preventDefault={page.onClick}>
				{page.text}
			</a>
		{/each}
		{#if block.more}
			<a
				href="# "
				class={moreClass}
				on:click|preventDefault={() => setPage(phrases.icons.moreAsNumber ? 2 : 'more')}>
				{phrases.icons.more}
			</a>
		{/if}
		{#if nextPage !== -1}
			<a
				href="# "
				class={arrowClass + 'next'}
				title={phrases.pagination.next}
				on:click|preventDefault={() => setPage(nextPage)}>
				<UIIcon icon="right">&gt;</UIIcon>
			</a>
		{/if}
	</div>
{/if}
