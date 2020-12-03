<script lang="typescript">
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { phrases } from '../../../../../config/phrases';
	import Input from '../../../../forms/Input.svelte';

	// Input property: width or height
	type Props = 'width' | 'height';
	export let prop: Props;

	// Value
	export let value: string;

	// Placeholder text
	export let placeholder: string;

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Get title
	let title: string;
	$: {
		title = phrases.footerBlocks[prop];
	}

	let lastValue = value;
	let inputValue = value;
	$: {
		// Change inputValue when value changes
		if (lastValue !== value) {
			lastValue = value;
			inputValue = value;
		}
	}

	// Check input
	function onInput(newValue: string) {
		inputValue = newValue;

		// Clean up number: make sure it is empty or complete
		let cleanValue = newValue;
		if (newValue !== '') {
			const num = parseFloat(newValue);
			cleanValue = '' + num;
			if (isNaN(num) || cleanValue !== newValue || num <= 0) {
				return;
			}
		}

		customise(prop, cleanValue);
	}

	// Reset to last valid value
	function onBlur() {
		inputValue = value;
	}
</script>

<Input
	value={inputValue}
	{placeholder}
	{title}
	{onInput}
	{onBlur}
	icon={'icon-' + prop}
	type="number" />
