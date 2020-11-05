<script lang="typescript">
	import type { FullRoute, ViewBlocks } from '@iconify/search-core';
	import type { SelectedIcons } from '../wrapper/icons';
	import type { WrappedRegistry } from '../wrapper/registry';
	import type { IconCustomisations } from '../customisations/types';
	import Wrapper from './main/Wrapper.svelte';
	// import Navigation from './main/Navigation.svelte';
	import Content from './main/Content.svelte';
	import Footer from './main/Footer.svelte';

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
</script>

{#if hidden !== true}
	<Wrapper>
		<!-- <Navigation {registry} {route} /> -->
		<Content
			{registry}
			{selection}
			{selectionLength}
			{viewChanged}
			{error}
			{route}
			{blocks} />
		<Footer
			{registry}
			{selection}
			{selectionLength}
			{route}
			{customisations} />
	</Wrapper>
{/if}
