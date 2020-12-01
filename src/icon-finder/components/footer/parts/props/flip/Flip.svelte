<script lang="typescript">
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { phrases } from '../../../../../config/phrases';
	import Block from '../Block.svelte';
	import Button from '../../../../forms/OptionButton.svelte';

	// Icon customisations
	export let customisations: IconCustomisations;

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Dynamically generate list of icons, using keys to force redrawing button, triggering css animation
	interface ListItem {
		prop: keyof IconCustomisations;
		icon: string;
		key: string;
		title: string;
	}
	let list: ListItem[];
	$: {
		list = [
			addItem('h', customisations.hFlip),
			addItem('v', customisations.vFlip),
		];
	}

	function addItem(key: string, selected: boolean): ListItem {
		const prop = (key + 'Flip') as keyof IconCustomisations;
		return {
			prop,
			icon: key + '-flip',
			key: key + 'Flip' + (selected ? '!' : ''),
			title: (phrases.footerOptionButtons as Record<string, string>)[
				prop
			],
		};
	}

	// Toggle
	function flipClicked(type: keyof IconCustomisations) {
		customise(type, !customisations[type]);
	}
</script>

<Block type="flip">
	{#each list as item, i (item.key)}
		<Button
			icon={item.icon}
			title={item.title}
			status={customisations[item.prop] ? 'checked' : 'unchecked'}
			onClick={() => flipClicked(item.prop)} />
	{/each}
</Block>
