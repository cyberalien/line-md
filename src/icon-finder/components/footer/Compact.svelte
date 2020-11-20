<script lang="typescript">
	import { getContext } from 'svelte';
	import type {
		Icon,
		FullRoute,
		CollectionInfoBlock,
	} from '@iconify/search-core';
	import { iconToString, getCollectionInfo } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import type { IconCustomisations } from '../../customisations/types';
	import { phrases } from '../../config/phrases';
	import {
		showCollectionInfoBlock,
		showButtons,
		showInfoInFooter,
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
	import FooterBlock from './misc/Block.svelte';
	import InfoBlock from '../blocks/CollectionInfo.svelte';
	import { IconName, CodeBlock } from '../../config/footer-components';

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

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

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

	// Check if info block should be shown
	let infoBlock: CollectionInfoBlock | null;
	let infoBlockTitle: string;
	$: {
		let showInfo = true;

		// Get provider and prefix for info
		let provider = '';
		let prefix = '';
		if (!showInfoInFooter || !icons.length) {
			// Disabled
			showInfo = false;
		} else if (icon) {
			// One icon is selected: show info for that icon
			provider = icon.provider;
			prefix = icon.prefix;
		} else {
			// Multiple icons are selected: show info if all of them have the same prefix
			for (let i = 0; i < icons.length; i++) {
				const icon = icons[i];
				if (!i) {
					prefix = icon.prefix;
					provider = icon.provider;
					continue;
				}
				if (icon.provider !== provider || icon.prefix !== prefix) {
					showInfo = false;
					break;
				}
			}
		}

		// Check route
		if (
			showCollectionInfoBlock &&
			showInfo &&
			route.type === 'collection' &&
			provider === route.params.provider &&
			prefix === route.params.prefix
		) {
			// Already showing info for the same icon set above icons list
			showInfo = false;
		}

		// Get data
		if (showInfo) {
			const info = getCollectionInfo(
				registry.collections,
				provider,
				prefix
			);
			if (!info) {
				infoBlock = null;
				infoBlockTitle = '';
			} else {
				infoBlock = {
					type: 'collection-info',
					prefix,
					info,
				};
				infoBlockTitle = phrases.footer.about.replace(
					'{title}',
					info.name
				);
			}
		} else {
			infoBlock = null;
			infoBlockTitle = '';
		}
	}
</script>

{#if showButtons || hasIcons}
	<Block type="footer">
		{#if icons.length > 1}
			<IconsList {route} {icons} {customisations} {selected} {onSelect} />
		{/if}
		{#if icon}
			<IconName {icon} {route} />
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
				{#if infoBlock}
					<FooterBlock name="info" title={infoBlockTitle}>
						<InfoBlock
							name="info"
							block={infoBlock}
							short={true}
							showTitle={false} />
					</FooterBlock>
				{/if}
				{#if showCustomisatons && hasIcons}
					<PropertiesContainer {icons} {customise} {customisations} />
				{/if}
				{#if showCode && icon}
					<CodeBlock {icon} {customisations} />
				{/if}
				{#if showButtons}
					<ButtonsContainer {icons} {route} />
				{/if}
			</div>
		</div>
	</Block>
{/if}
