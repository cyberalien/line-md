<script lang="typescript">
	import { getContext } from 'svelte';
	import { getCollectionTitle } from '@iconify/search-core';
	import type { FullRoute } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { phrases } from '../../../config/phrases';
	import Block from '../Block.svelte';
	import Link from './parent/Link.svelte';
	import type {
		FullCollectionRouteParams,
		FullCustomRouteParams,
	} from '@iconify/search-core/lib/route/types/params';

	// Route
	export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	const parentPhrases = phrases.parent;
	const collections = registry.collections;

	function handleClick(level: number) {
		registry.router.action('parent', level);
	}

	interface Entry {
		key: string;
		level: number;
		route: FullRoute;
		text: string;
	}
	let entries: Entry[];
	$: {
		function addEntry(route: FullRoute, level: number) {
			const routeParams = route.params;

			// Get text
			let text = parentPhrases.default;
			if (
				route.type === 'custom' &&
				parentPhrases[route.params.customType] !== void 0
			) {
				// Text for custom view
				text =
					parentPhrases[
						(routeParams as FullCustomRouteParams).customType
					];
			} else if (parentPhrases[route.type] !== void 0) {
				// Text by view type
				text = parentPhrases[route.type];

				if (route.type === 'collection') {
					// Replace {name} with collection name
					text = text.replace(
						'{name}',
						getCollectionTitle(
							collections,
							(routeParams as FullCollectionRouteParams).provider,
							(routeParams as FullCollectionRouteParams).prefix
						)
					);
				}
			}

			// Generate unique key
			let key = route.type + '-' + level + '-';
			switch (route.type) {
				case 'collection':
					key +=
						(routeParams as FullCollectionRouteParams).provider +
						':' +
						(routeParams as FullCollectionRouteParams).prefix;
					break;

				case 'custom':
					key += (routeParams as FullCustomRouteParams).customType;
					break;
			}

			// Add entry
			entries.unshift({
				key,
				level,
				route,
				text,
			});

			// Add parent route
			if (route.parent) {
				addEntry(route.parent, level + 1);
			}
		}

		// Find all parent routes
		entries = [];
		if (route.parent) {
			addEntry(route.parent, 1);
		}
	}
</script>

{#if entries.length > 0}
	<Block type="parent">
		{#each entries as item, i (item.key)}
			<Link text={item.text} onClick={() => handleClick(item.level)} />
		{/each}
	</Block>
{/if}
