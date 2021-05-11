<script lang="typescript">
	import { getContext } from 'svelte';
	import type { FullRoute } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { phrases } from '../../../config/phrases';
	import { canFocusSearch } from '../../../config/components';
	import Input from '../../ui/Input.svelte';
	import Block from '../Block.svelte';

	// Router data
	export let viewChanged: boolean;
	export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Phrases
	const text = phrases.search;

	// Current keyword
	let keyword: string | undefined;

	// Variable to store last change to avoid changing keyword multiple times to same value
	let lastChange: string = '';

	// Check route for keyword
	function checkRoute(route: FullRoute): boolean {
		if (
			route &&
			route.type === 'search' &&
			route.params &&
			(lastChange === '' || lastChange !== route.params.search)
		) {
			keyword = route.params.search;
			lastChange = keyword;
			return true;
		}
		return false;
	}

	// Submit form
	function submitForm() {
		if (typeof keyword === 'string') {
			const value = keyword.trim().toLowerCase();
			if (value !== '') {
				lastChange = value;
				registry.router.action('search', value);
			}
		}
	}

	// Overwrite keyword on first render or when current view changes to search results
	$: {
		if (keyword === null) {
			// First render - get keyword from route
			keyword = '';
			if (route !== null) {
				// Get keyword from current route or its parent
				if (!checkRoute(route) && route.parent) {
					checkRoute(route.parent);
				}
			}
		} else if (!viewChanged) {
			lastChange = '';
		} else {
			checkRoute(route);
		}
	}

	// Focus input, use "each" to re-mount input when value changes
	let focusInput: boolean = false;
	$: {
		if (canFocusSearch) {
			focusInput = route
				? route.type === 'collections' || route.type === 'search'
				: false;
		}
	}
</script>

<Block type="search" name="global">
	<form on:submit|preventDefault={submitForm} class="iif-block--search-form">
		{#each [focusInput] as autofocus, i (autofocus)}
			<Input
				type="text"
				bind:value={keyword}
				placeholder={text.defaultPlaceholder}
				icon="search"
				{autofocus} />
		{/each}
		<button class="iif-form-button iif-form-button--primary" type="submit">
			{text.button}
		</button>
	</form>
</Block>
