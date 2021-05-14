<script lang="typescript">
	import { getContext } from 'svelte';
	import type { IconifyIconCustomisations } from '@iconify/svelte';
	import IconComponent from '@iconify/svelte';
	import type { Icon, FullRoute } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type { WrappedRegistry } from '../../../../wrapper/registry';
	import { canShortenIconName } from '../../../../config/components';
	import { shortenIconName } from '../../../../footer/shorten-icon-name';
	import { phrases } from '../../../../config/phrases';
	import OptionsBlock from './OptionsBlock.svelte';
	import UIIcon from '../../../ui/UIIcon.svelte';

	// Selected icons
	export let icons: Icon[];

	// Current customisations
	export let customisations: IconCustomisations;

	// Current route
	export let route: FullRoute;

	// Selected icon
	export let selected: string = '';

	// Callback when new icon has been selected
	export let onSelect: ((icon: Icon) => void) | null = null;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Convert icons list to strings
	interface ListItem {
		icon: Icon;
		name: string;
		text: string;
		removeTitle: string;
		selectTitle: string;
		selected: boolean;
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
			const removeTitle = phrases.footer.remove.replace('{name}', text);
			const selectTitle = onSelect
				? phrases.footer.select.replace('{name}', text)
				: removeTitle;

			// Item
			const item: ListItem = {
				icon,
				name,
				text,
				removeTitle,
				selectTitle,
				selected: name === selected,
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
	function onClick(select: boolean, icon: Icon) {
		if (select && onSelect) {
			onSelect(icon);
			return;
		}
		registry.callback({
			type: 'selection',
			icon,
			selected: false,
		});
	}
</script>

<OptionsBlock type="icons">
	<ul class="iif-footer-icons" {style}>
		{#each items as item, i (item.name)}
			<li>
				<a
					href="# "
					on:click|preventDefault={() => {
						onClick(true, item.icon);
					}}
					title={item.selectTitle}>
					<IconComponent icon={item.name} {...props} />
					{#if !onSelect}
						<span class="iif-footer-icons-reset">
							<UIIcon icon="reset" />
						</span>
					{/if}
				</a>
				{#if onSelect}
					<a
						href="# "
						class="iif-footer-icons-reset"
						on:click|preventDefault={() => {
							onClick(false, item.icon);
						}}
						title={item.removeTitle}>
						<UIIcon icon="reset" />
					</a>
				{/if}
			</li>
		{/each}
	</ul>
</OptionsBlock>
