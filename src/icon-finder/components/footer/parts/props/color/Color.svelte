<script lang="typescript">
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import {
		stringToColor,
		colorToString,
	} from '@iconify/search-core/lib/misc/colors';
	import { phrases } from '../../../../../config/phrases';
	import { defaultColor } from '../../../../../config/components';
	import Input from '../../../../forms/Input.svelte';
	import Block from '../Block.svelte';

	// Selected icons
	export let icons: Icon[];

	// Current value
	export let value: string;

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Check if at least one icon has color
	let hasColor: boolean;
	$: {
		hasColor = false;
		if (Iconify.getIcon) {
			for (let i = 0; i < icons.length; i++) {
				const data = Iconify.getIcon(iconToString(icons[i]));
				if (data && data.body.indexOf('currentColor') !== -1) {
					hasColor = true;
					break;
				}
			}
		}
	}

	const title = phrases.footerBlocks.color;

	let lastValue = value;
	let inputValue = value;
	$: {
		// Change inputValue when value changes
		if (lastValue !== value) {
			lastValue = value;
			inputValue = value;
		}
	}

	// Convert color to valid string
	function getColor(value: string, defaultValue: string | null) {
		const color = stringToColor(value);
		if (!color) {
			return defaultValue;
		}
		const cleanColor = colorToString(color);
		return cleanColor === '' ? defaultValue : cleanColor;
	}

	// Check input
	function onInput(newValue: string) {
		inputValue = newValue;

		// Check for valid color
		if (newValue === '') {
			customise('color', '');
			return;
		}

		const validatedValue = getColor(newValue, null);
		if (validatedValue !== null) {
			// Change lastValue to avoid triggering component refresh
			lastValue = value = validatedValue;
			customise('color', validatedValue);
		}
	}

	// Reset to last valid value
	function onBlur() {
		// Set last value as input value
		inputValue = value;
	}
</script>

{#if hasColor}
	<Block type="color">
		<Input
			value={inputValue}
			placeholder={defaultColor}
			{title}
			{onInput}
			{onBlur}
			icon={value === void 0 || value === '' ? 'color' : 'color-filled'}
			extra={value === void 0 ? '' : value}
			type="color" />
	</Block>
{/if}
