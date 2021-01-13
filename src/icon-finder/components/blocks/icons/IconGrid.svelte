<script lang="typescript">
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { Icon } from '@iconify/search-core';
	import UIIcon from '../../misc/Icon.svelte';

	// Icon name
	export let name: string;

	// Tooltip
	export let tooltip: string;

	// Text
	// export let text: string;

	// Icon
	export let icon: Icon;

	// Loaded
	export let exists: boolean;

	// Selected
	export let selected: boolean;

	// Link
	export let link: string;

	// Callback (Router action)
	export let onClick: (event: string, value: string | Icon) => void;

	// Selecting multiple icons
	export let isSelecting: boolean;

	// Get class name
	const baseClass = 'iif-icon-grid';
	let className: string = '';
	$: {
		const newClassName =
			baseClass +
			' ' +
			baseClass +
			(exists || Iconify.renderPlaceholder ? '--loaded' : '--loading') +
			(selected ? ' ' + baseClass + '--selected' : '');
		if (newClassName !== className) {
			// Trigger re-render only if value was changed
			className = newClassName;
		}
	}

	// Get SVG
	const iconParams = {
		width: '1em',
		height: '1em',
		inline: false,
	};
	let svg: string | null;
	$: {
		const newSVG: string | null = Iconify.renderPlaceholder
			? Iconify.renderPlaceholder(name, iconParams)
			: exists && Iconify.renderHTML
			? Iconify.renderHTML(name, iconParams)!
			: null;
		if (newSVG !== svg) {
			// Trigger re-render only if SVG was changed
			svg = newSVG;
		}
	}

	// Select icon
	function handleClick() {
		onClick(
			isSelecting ? (selected ? 'deselect' : 'select') : 'toggle',
			icon
		);
	}
</script>

<li class={className}>
	<a
		href={link}
		target="_blank"
		title={tooltip}
		on:click|preventDefault={handleClick}>
		{#if svg !== null}
			{@html svg}
			{#if isSelecting}
				<UIIcon
					icon={selected ? 'selecting-selected' : 'selecting-unselected'} />
			{/if}
		{/if}
	</a>
</li>
