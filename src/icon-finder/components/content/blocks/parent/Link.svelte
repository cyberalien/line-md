<script lang="typescript">
	import UIIcon from '../../../ui/UIIcon.svelte';

	// Link text
	export let text: string;

	// Depth level
	// export let level: number;

	// Callback
	export let onClick: () => void;
</script>

<div class="iif-parent-link">
	<UIIcon icon="parent"><span>&lt;</span></UIIcon>
	<a href="# " on:click|preventDefault={onClick}>{text}</a>
</div>
