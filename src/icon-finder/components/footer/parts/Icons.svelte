<script lang="typescript">
	import type { IconifyIconCustomisations } from '@iconify/iconify';
	import type { Icon, FullRoute } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import type { IconCustomisations } from '../../../customisations/types';
	import { canShortenIconName } from '../../../config/components';
	import { shortenIconName } from '../../../footer/shorten-icon-name';
	import { phrases } from '../../../config/phrases';
	import Block from './props/Block.svelte';
	import UIIcon from '../../misc/Icon.svelte';

	// Registry
	export let registry: WrappedRegistry;

	// Selected icons
	export let icons: Icon[];

	// Current customisations
	export let customisations: IconCustomisations;

	// Current route
	export let route: FullRoute;

	// Convert icons list to strings
	interface ListItem {
		icon: Icon;
		name: string;
		text: string;
		title: string;
	}
	let items: ListItem[];
	$: {
		items = [];
		icons.forEach((icon) => {
			// Full name
			const name = iconToString(icon);

			// Do not show prefix if viewing collection
			const text = canShortenIconName
				? shortenIconName(route, icon, name)
				: name;

			// Hint
			const title = phrases.footer.remove.replace('{name}', text);

			// Item
			const item: ListItem = {
				icon,
				name,
				text,
				title,
			};
			items.push(item);
		});
	}

	// Copy customisations
	const transformations: (keyof IconCustomisations)[] = [
		'rotate',
		'hFlip',
		'vFlip',
	];
	let props: IconifyIconCustomisations;
	let style: string;
	$: {
		props = {};

		// Transformations
		transformations.forEach((key) => {
			if (customisations[key]) {
				(props as Record<string, unknown>)[key] = customisations[key];
			}
		});

		// Height
		if (
			typeof customisations.height === 'number' &&
			customisations.height < 32
		) {
			props.height = customisations.height;
			// Width, but only if height is set
			if (customisations.width) {
				props.width = customisations.width;
			}
		}

		// Color
		style = '';
		if (customisations.color !== '') {
			style = 'color: ' + customisations.color + ';';
		}
	}

	// Toggle icon
	function onClick(icon: Icon) {
		registry.callback({
			type: 'selection',
			icon,
			selected: false,
		});
	}
</script>

<Block type="icons">
	<div class="iif-footer-icons" {style}>
		{#each items as item, i (item.name)}
			<a
				href="# "
				on:click|preventDefault={() => {
					onClick(item.icon);
				}}
				title={item.title}>
				<UIIcon icon={item.name} {props} />
				<UIIcon icon="reset" />
			</a>
		{/each}
	</div>
</Block>
