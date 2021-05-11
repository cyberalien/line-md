<script lang="typescript">
	import { setContext } from 'svelte';
	import type { FullRoute, ViewBlocks } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type { SelectedIcons } from '../wrapper/icons';
	import type { WrappedRegistry } from '../wrapper/registry';
	import Wrapper from './Wrapper.svelte';
	import Content from './content/Content.svelte';
	import Footer from './content/Footer.svelte';

	/**
	 * Global exports
	 */
	export let registry: WrappedRegistry;
	export let selection: SelectedIcons;
	export let selectionLength: number;
	export let customisations: IconCustomisations;
	export let hidden: boolean;

	// RouterEvent with full route
	export let viewChanged: boolean;
	export let error: string;
	export let route: FullRoute;
	export let blocks: ViewBlocks | null;

	// Set context
	setContext('registry', registry);
</script>

{#if hidden !== true}
	<Wrapper>
		<Content {selection} {viewChanged} {error} {route} {blocks} />
		<Footer {selection} {selectionLength} {route} {customisations} />
	</Wrapper>
{/if}
