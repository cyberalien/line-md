<script lang="typescript">
	import type { Icon, FullRoute } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { showButtons } from '../../../config/components';
	import Block from '../Block.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';

	// Selected icons
	export let icons: Icon[];

	// Callback
	// export let customise: (
	// 	key: keyof IconCustomisations,
	// 	value: unknown
	// ) => void;

	// Customisations
	// export let customisations: IconCustomisations;

	// Current route
	export let route: FullRoute;
</script>

{#if showButtons}
	<Block type="footer">
		<ButtonsContainer {icons} {route} />
	</Block>
{/if}
