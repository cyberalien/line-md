<script lang="typescript">
	import IconComponent from '@iconify/svelte';
	import type { Icon } from '@iconify/search-core';
	import UIIcon from '../../../ui/UIIcon.svelte';

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
	let className: string;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			(exists ? '--loaded' : '--loading') +
			(selected ? ' ' + baseClass + '--selected' : '');
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
		{#if exists}
			<IconComponent icon={name} width="1em" height="1em" />
			{#if isSelecting}
				<UIIcon
					icon={selected ? 'selecting-selected' : 'selecting-unselected'} />
			{/if}
		{:else}<span class="iif-icon-loading">{icon.name}</span>{/if}
	</a>
</li>
