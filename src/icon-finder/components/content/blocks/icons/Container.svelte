<script lang="typescript">
	import { getContext, onMount } from 'svelte';
	import { getIcon, loadIcons } from '@iconify/svelte';
	import {
		iconToString,
		cloneObject,
		compareObjects,
		getProvider,
		ViewBlocks,
		Icon,
		FullRoute,
		SearchViewBlocks,
		CollectionViewBlocks,
		FiltersBlock,
	} from '@iconify/search-core';
	import { onDestroy } from 'svelte';
	import type { SelectedIcons } from '../../../../wrapper/icons';
	import { isIconSelected } from '../../../../wrapper/icons';
	import type { WrappedRegistry } from '../../../../wrapper/registry';
	import { phrases } from '../../../../config/phrases';
	import IconList from './IconList.svelte';
	import IconGrid from './IconGrid.svelte';
	import type { IconsListFilter } from '../../../types';

	// Current route
	export let route: FullRoute;

	// Selected icons
	export let selection: SelectedIcons;

	// Blocks to render
	export let blocks: ViewBlocks;

	// Layout
	export let isList: boolean;

	// Selecting multiple icons
	export let isSelecting: boolean;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Base class name
	const baseClass = 'iif-icons';

	// List of keys used for filters. Same keys are used in both blocks and icon.
	const filterKeys: (keyof CollectionViewBlocks & keyof Icon)[] = [
		'tags',
		'themePrefixes',
		'themeSuffixes',
	];

	// Tooltip
	const tooltipText = phrases.icons.tooltip;

	// Show prefix
	let showPrefix: boolean;
	$: {
		showPrefix = route.type !== 'collection';
	}

	// Event listener for loading icons, which should be loaded only when component is mounted
	// 0 = not mounted, 1 = just mounted, 2 = has been mounted
	let mounted = 0;
	let abortLoader: (() => void) | null = null;
	let updateCounter: number = 0;

	const loadingEvent = () => {
		updateCounter++;
	};

	onMount(() => {
		mounted = 1;
	});

	// Get filters to list view
	interface IncompleteGridItem {
		name: string; // Icon name
		tooltip: string;
		icon: Icon;
		exists: boolean;
		link: string;
		selected: boolean;
	}
	interface IncompleteListItem extends IncompleteGridItem {
		text: string; // Icon name as text (could be shortened, used in list view)
	}
	interface ListItem extends IncompleteListItem {
		filters: IconsListFilter[];
	}

	function getFilters(item: ListItem): IconsListFilter[] {
		let filters: IconsListFilter[] = [];
		const icon = item.icon;

		// Filters
		filterKeys.forEach((k) => {
			const key = k as keyof CollectionViewBlocks & keyof Icon;
			if (!(blocks as CollectionViewBlocks)[key]) {
				return;
			}
			if (icon[key] === void 0) {
				return;
			}

			const block = (blocks as CollectionViewBlocks)[key] as FiltersBlock;
			const active = block.active;
			const iconValue = icon[key];

			(typeof iconValue === 'string'
				? [iconValue]
				: iconValue instanceof Array
				? iconValue
				: []
			).forEach((value) => {
				if (value === active) {
					return;
				}
				if (block.filters[value] !== void 0) {
					filters.push({
						action: key,
						value: value,
						item: block.filters[value],
					});
				}
			});
		});

		// Icon sets
		if (route.type === 'search') {
			const searchBlocks = blocks as SearchViewBlocks;
			if (searchBlocks.collections) {
				const prefix = item.icon.prefix;
				if (searchBlocks.collections.filters[prefix]) {
					filters.push({
						action: 'collections',
						value: prefix,
						item: searchBlocks.collections.filters[prefix],
					});
				}
			}
		}

		return filters;
	}

	// Filter icons
	let parsedIcons: ListItem[] = [];
	$: {
		// Mention updateCounter to make sure this code is ran
		updateCounter;

		// Reset icons list
		let newParsedIcons: ListItem[] = [];

		// Parse icons
		let pending: string[] = [];

		// Map old icons, but only if this code has already been ran
		const oldKeys = Object.create(null);
		if (mounted === 2) {
			parsedIcons.forEach((icon) => {
				oldKeys[icon.name] = icon;
			});
		} else if (mounted === 1) {
			// Mark as mounted + code ran once
			mounted = 2;
		}

		let updated = false;
		(blocks as CollectionViewBlocks).icons.icons.forEach((icon) => {
			const name = iconToString(icon);
			const data = getIcon(name);
			const exists = data !== null;

			// Icon name, used in list view and tooltip
			const text = showPrefix ? name : icon.name;

			// Tooltip
			let tooltip = text;
			if (data) {
				tooltip += tooltipText.size.replace(
					'{size}',
					data.width + ' x ' + data.height
				);
				tooltip += tooltipText.length.replace(
					'{length}',
					data.body.length + ''
				);
				if (icon.chars !== void 0) {
					tooltip += tooltipText.char.replace(
						'{char}',
						typeof icon.chars === 'string'
							? icon.chars
							: icon.chars.join(', ')
					);
				}
				tooltip +=
					tooltipText[
						data.body.indexOf('currentColor') === -1
							? 'colorful'
							: 'colorless'
					];
			}

			// Link
			const providerData = getProvider(icon.provider);
			let link;
			if (providerData) {
				link = providerData.links.icon
					.replace('{prefix}', icon.prefix)
					.replace('{name}', icon.name);
				if (link === '') {
					link = '#';
				}
			} else {
				link = '#';
			}

			// Item
			let newItem: IncompleteListItem = {
				name,
				text,
				tooltip,
				icon: cloneObject(icon) as typeof icon,
				exists,
				link,
				selected: isIconSelected(selection, icon),
			};
			let item = newItem as ListItem;

			if (isList) {
				// Add filters
				item.filters = getFilters(item);
			}

			// Check if item has been updated, use old item if not to avoid re-rendering child component
			if (oldKeys[name] === void 0) {
				updated = true;
				if (!exists) {
					pending.push(name);
				}
			} else if (!compareObjects(oldKeys[name], item)) {
				updated = true;
			} else {
				item = oldKeys[name];
			}

			newParsedIcons.push(item);
		});

		// Load pending images, but only after component has been mounted
		if (mounted > 0 && pending.length) {
			if (abortLoader !== null) {
				abortLoader();
			}
			abortLoader = loadIcons(pending, loadingEvent);
		}

		// Overwrite parseIcons variable only if something was updated, triggering component re-render
		// Also compare length in case if new set is subset of old set
		if (updated || parsedIcons.length !== newParsedIcons.length) {
			parsedIcons = newParsedIcons;
		}
	}

	// Icon or filter was clicked
	function onClick(event: string, value: string | Icon) {
		if (event === 'toggle') {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: value,
			});
			return;
		}
		if (event === 'select' || event === 'deselect') {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: value,
				selected: event === 'select',
			});
			return;
		}
		registry.router.action(event, value as string);
	}

	// Remove event listener
	onDestroy(() => {
		if (abortLoader !== null) {
			abortLoader();
			abortLoader = null;
		}
	});
</script>

<div
	class={baseClass + ' ' + baseClass + (isList ? '--list' : '--grid') + (isSelecting ? ' ' + baseClass + '--selecting' : '')}>
	<ul>
		{#each parsedIcons as item, i (item.name)}
			{#if isList}
				<IconList {...item} {onClick} {isSelecting} />
			{:else}
				<IconGrid {...item} {onClick} {isSelecting} />
			{/if}
		{/each}
	</ul>
</div>
