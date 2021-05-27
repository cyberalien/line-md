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

	// Get class name
	const baseClass = 'iif-option-button';
	let className: string;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			(icon ? '--with-icon' : '--without-icon') +
			' ' +
			baseClass +
			((text && !textOptional) || !icon
				? '--with-text'
				: '--without-text') +
			(status === '' ? '' : ' ' + baseClass + '--' + status);
	}
</script>

<button class={className} {title} on:click={onClick}>
	{#if icon}
		<UIIcon {icon} />
	{/if}
	<span>{text ? text : title}</span>
</button>
