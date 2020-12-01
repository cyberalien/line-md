<script lang="typescript">
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { phrases } from '../../../../../config/phrases';
	import Block from '../Block.svelte';
	import Button from '../../../../forms/OptionButton.svelte';

	// Current value
	export let value: boolean;

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Phrases
	const buttonPhrases = phrases.footerOptionButtons as Record<string, string>;

	// Dynamically generate list of icons, using keys to force redrawing button, triggering css animation
	interface ListItem {
		key: string;
		inline: boolean;
		mode: string;
		selected: boolean;
		temp: number;
	}
	let list: ListItem[];
	$: {
		const newList = [];
		for (let i = 0; i < 2; i++) {
			const inline = !!i;
			if (list && list[i] && value !== inline) {
				// Not selected and exists: keep old item to avoid re-render
				const oldItem = list[i];
				oldItem.selected = false;
				newList.push(oldItem);
			} else {
				// Update key to force re-render
				newList.push(
					addItem(
						inline,
						value === inline,
						list && list[i] ? list[i].temp + 1 : 0
					)
				);
			}
		}
		list = newList;
	}

	function addItem(
		inline: boolean,
		selected: boolean,
		temp: number
	): ListItem {
		const mode = inline ? 'inline' : 'block';
		return {
			mode,
			inline,
			key: mode + temp,
			selected,
			temp,
		};
	}

	function inlineClicked() {
		customise('inline', !value);
	}
</script>

<Block type="mode">
	{#each list as { mode, inline, key }, i (key)}
		<Button
			icon={'mode-' + mode}
			text={buttonPhrases[mode]}
			title={buttonPhrases[mode + 'Hint']}
			status={value === inline ? 'checked' : 'unchecked'}
			textOptional={true}
			onClick={inlineClicked} />
	{/each}
</Block>
