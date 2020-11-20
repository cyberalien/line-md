<script lang="typescript">
	import type { Icon, FullRoute } from '@iconify/search-core';
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
		icon = icons.length === 1 ? icons[0] : null;
	}
</script>

{#if showButtons || hasIcons}
	<Block type="footer">
		<div class={icon ? 'iif-footer-full' : ''}>
			{#if icon}
				{#if customiseInline && customisations.inline}
					<InlineSample {icon} {customisations} />
				{:else}
					<Sample {icon} {customisations} />
				{/if}
			{/if}
			<div class={icon ? 'iif-footer-full-content' : ''}>
				{#if icon}
					<IconName {registry} {icon} {route} />
				{:else if hasIcons}
					<IconsList {registry} {route} {icons} {customisations} />
				{/if}
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
