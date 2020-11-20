<script lang="typescript">
	import type { FullRoute, ViewBlocks } from '@iconify/search-core';
	import { listProviders } from '@iconify/search-core';
	import type { SelectedIcons } from '../../wrapper/icons';
	import { showProviders, canAddProviders } from '../../config/components';
	import { getActiveProvider } from '../../provider/get-provider';
	import SearchBlock from '../blocks/GlobalSearch.svelte';
	import ParentBlock from '../blocks/Parent.svelte';
	import ProvidersBlock from '../blocks/Providers.svelte';
	import ViewError from '../views/Error.svelte';
	import CollectionsView from '../views/Collections.svelte';
	import CollectionView from '../views/Collection.svelte';
	import SearchView from '../views/Search.svelte';
	import CustomView from '../views/Custom.svelte';

	/**
	 * Global exports
	 */
	export let selection: SelectedIcons;

	// RouterEvent
	export let viewChanged: boolean;
	export let error: string;
	export let route: FullRoute;
	export let blocks: ViewBlocks | null;

	// Get container class name
	const baseClass = 'iif-content';
	let className: string;
	$: {
		// Check class name and search form value
		className = baseClass;

		if (error !== '') {
			// View shows error
			className +=
				' ' + baseClass + '--error ' + baseClass + '--error--' + error;
		} else {
			// View shows something
			className +=
				' ' +
				baseClass +
				'--view ' +
				baseClass +
				'--view--' +
				route.type;

			if (
				route.params &&
				(route.type === 'search' ||
					route.type === 'collections' ||
					route.type === 'collection') &&
				route.params.provider
			) {
				// Add provider: '{base}--view--{type}--provider--{provider}'
				className +=
					' ' +
					baseClass +
					'--view--' +
					route.type +
					'--provider--' +
					route.params.provider;
			}

			if (route.type === 'collection') {
				// Add prefix: '{base}--view--collection--prefix--{prefix}'
				className +=
					' ' +
					baseClass +
					'--view--collection--prefix--' +
					route.params.prefix;
			} else if (route.type === 'custom') {
				// Add custom type: '{base} {base}--view {base}--view--custom {base}--view--custom--{customType}'
				className +=
					' ' +
					baseClass +
					'--view--custom--' +
					route.params.customType;
			}
		}
	}

	// Check if collections list is in route, don't show global search if its not there
	let showGlobalSearch: boolean;
	$: {
		showGlobalSearch = false;
		let item: FullRoute | null = route;
		while (!showGlobalSearch && item) {
			if (item.type === 'collections') {
				showGlobalSearch = true;
			} else {
				item = item.parent;
			}
		}
	}

	/**
	 * Check if route is capable of having provider
	 */
	function isProviderEnabledRoute(route: FullRoute): boolean {
		switch (route.type) {
			case 'collections':
			case 'collection':
			case 'search':
				return true;
		}
		return route.parent ? isProviderEnabledRoute(route.parent) : false;
	}

	// Get providers
	let providersVisible: boolean = canAddProviders;
	let activeProvider: string = '';
	let providers: string[] = [''];
	$: {
		if (showProviders && isProviderEnabledRoute(route)) {
			const providersList = listProviders();
			if (providersList.length > 1) {
				providersVisible = true;

				// Get current provider
				activeProvider = getActiveProvider(route);

				// Create new list of providers
				if (!providers || providers.length !== providersList.length) {
					providers = providersList;
				}
			} else {
				providersVisible = canAddProviders;
			}
		} else {
			providersVisible = false;
		}
	}
</script>

<div class={className}>
	{#if providersVisible}
		<ProvidersBlock {providers} {activeProvider} />
	{/if}

	{#if showGlobalSearch}
		<SearchBlock {viewChanged} {route} />
	{/if}

	{#if route?.parent}
		<ParentBlock {route} />
	{/if}

	{#if !route || route.type !== 'empty'}
		{#if error !== '' || !route}
			<ViewError error={error !== '' ? error : 'bad_route'} {route} />
		{:else if route.type === 'collections'}
			<CollectionsView {route} {blocks} />
		{:else if route.type === 'collection'}
			<CollectionView {route} {blocks} {selection} />
		{:else if route.type === 'search'}
			<SearchView {route} {blocks} {selection} />
		{:else if route.type === 'custom'}
			<CustomView {route} {blocks} {selection} />
		{:else}
			<ViewError error="bad_route" {route} />
		{/if}
	{/if}
</div>
