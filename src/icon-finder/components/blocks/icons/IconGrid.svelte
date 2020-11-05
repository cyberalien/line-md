<script lang="typescript">
	import Iconify from '@iconify/iconify';
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
			(exists ? '--loaded' : '--loading') +
			(selected ? ' ' + baseClass + '--selected' : '');
		if (newClassName !== className) {
			// Trigger re-render only if value was changed
			className = newClassName;
		}
	}

	// Get SVG
	let svg: string | boolean = false;
	$: {
		const newSVG: string | boolean = exists
			? Iconify.renderHTML(name, {
					width: '1em',
					height: '1em',
					inline: false,
			  })!
			: false;
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
		{#if svg !== false}
			{@html svg}
			{#if isSelecting}
				<UIIcon
					icon={selected ? 'selecting-selected' : 'selecting-unselected'} />
			{/if}
		{/if}
	</a>
</li>
