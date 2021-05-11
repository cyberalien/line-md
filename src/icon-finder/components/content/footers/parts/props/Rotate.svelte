<script lang="typescript">
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { phrases } from '../../../../../config/phrases';
	import OptionsBlock from '../OptionsBlock.svelte';
	import Button from '../../../../ui/OptionButton.svelte';

	// Current value
	export let value: number;

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Get text
	const buttonPhrases = phrases.footerOptionButtons as Record<string, string>;

	// Dynamically generate list of icons, using keys to force redrawing button, triggering css animation
	interface ListItem {
		key: string;
		count: number;
		selected: boolean;
		temp: number;
	}
	let list: ListItem[];
	$: {
		const newList = [];
		for (let i = 0; i < 4; i++) {
			if (list && list[i] && value !== i) {
				// Not selected and exists: keep old item to avoid re-render
				const oldItem = list[i];
				oldItem.selected = false;
				newList.push(oldItem);
			} else {
				// Update key to force re-render
				newList.push(
					addItem(
						i,
						value === i,
						list && list[i] ? list[i].temp + 1 : 0
					)
				);
			}
		}
		list = newList;
	}

	function addItem(count: number, selected: boolean, temp: number): ListItem {
		return {
			count,
			key: count + '-' + temp,
			selected,
			temp,
		};
	}

	function rotateClicked(count: number) {
		if (!count && !value) {
			return;
		}
		customise('rotate', count === value ? 0 : count);
	}
</script>

<OptionsBlock type="rotate">
	{#each list as { count, key }, i (key)}
		<Button
			icon={'rotate' + count}
			title={buttonPhrases.rotateTitle.replace('{num}', count * 90 + '')}
			text={buttonPhrases.rotate.replace('{num}', count * 90 + '')}
			status={value === count ? 'checked' : 'unchecked'}
			onClick={() => rotateClicked(count)} />
	{/each}
</OptionsBlock>
