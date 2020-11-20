<script lang="typescript">
	import type { Icon, FullRoute } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import type { IconCustomisations } from '../../customisations/types';
	import {
		showButtons,
		showCustomisatons,
		showCode,
		customiseInline,
	} from '../../config/components';
	import Block from '../blocks/Block.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';
	import PropertiesContainer from './parts/Properties.svelte';
	import Sample from './parts/samples/Full.svelte';
	import InlineSample from './parts/samples/Inline.svelte';
	import IconsList from './parts/Icons.svelte';
	import { IconName, CodeBlock } from '../../config/footer-components';

	// Registry
	export let registry: WrappedRegistry;

	// Selected icons
	export let icons: Icon[];

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Customisations
	export let customisations: IconCustomisations;

	// Current route
	export let route: FullRoute;

	// Check if icons are selected, get first icon
	let icon: Icon | null;
	let hasIcons: boolean;
	$: {
		hasIcons = icons.length > 0;
		switch (icons.length) {
			case 0:
				icon = null;
				break;

			case 1:
				icon = icons[0];
				break;

			default:
				icon = null;
				if (selected !== '') {
					// Find selected icon
					for (let i = 0; i < icons.length; i++) {
						if (iconToString(icons[i]) === selected) {
							icon = icons[i];
							break;
						}
					}
				}
		}
	}

	// Select icon from multiple icons
	// Remove onSelect reference from IconsList component to disable functionality
	let selected: string = '';
	function onSelect(selection: Icon): void {
		selected = iconToString(selection);
		icon = selection;
	}
</script>

{#if showButtons || hasIcons}
	<Block type="footer">
		{#if icons.length > 1}
			<IconsList
				{registry}
				{route}
				{icons}
				{customisations}
				{selected}
				{onSelect} />
		{/if}
		{#if icon}
			<IconName {registry} {icon} {route} />
		{/if}
		<div class={icon ? 'iif-footer-full' : ''}>
			{#if icon}
				{#if customiseInline && customisations.inline}
					<InlineSample {icon} {customisations} />
				{:else}
					<Sample {icon} {customisations} />
				{/if}
			{/if}
			<div class={icon ? 'iif-footer-full-content' : ''}>
				{#if showCustomisatons && hasIcons}
					<PropertiesContainer
						{registry}
						{icons}
						{customise}
						{customisations} />
				{/if}
				{#if showCode && icon}
					<CodeBlock {registry} {icon} {customisations} />
				{/if}
				{#if showButtons}
					<ButtonsContainer {registry} {icons} {route} />
				{/if}
			</div>
		</div>
	</Block>
{/if}
