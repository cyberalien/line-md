<script lang="typescript">
	import UIIcon from './UIIcon.svelte';

	// Icon
	export let icon: string;

	// Title
	export let title: string;

	// Callback
	export let onClick: () => void;
</script>

<button class="iif-icon-button" {title} on:click={onClick}>
	<UIIcon {icon} />
</button>
