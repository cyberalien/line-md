<script lang="typescript">
	import UIIcon from './UIIcon.svelte';

	// Optional icon to show before button
	export let icon: string = '';

	// Event to trigger
	export let onClick: () => void;

	// Title
	export let title: string;

	// Text (using title if missing)
	export let text: string | null = null;

	// If true, text is shown only if icon is missing
	export let textOptional: boolean = false;

	// Status to add to class
	export let status: string = '';

	// Icon status
	let hasIcon: boolean = false;
	function iconLoaded() {
		hasIcon = true;
	}

	// Get class name
	const baseClass = 'iif-option-button';
	let className: string;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			(hasIcon ? '--with-icon' : '--without-icon') +
			' ' +
			baseClass +
			((text && !textOptional) || !hasIcon
				? '--with-text'
				: '--without-text') +
			(status === '' ? '' : ' ' + baseClass + '--' + status);
	}
</script>

<button class={className} {title} on:click={onClick}>
	{#if icon}
		<UIIcon {icon} onLoad={iconLoaded} />
	{/if}
	<span>{text ? text : title}</span>
</button>
