<script lang="typescript">
	import type { Icon } from '@iconify/search-core';
	import type { IconCustomisations } from '../../../customisations/types';
	import { phrases } from '../../../config/phrases';
	import FooterBlock from '../misc/Block.svelte';
	import {
		showFooterBlockTitles,
		customiseColor,
		customiseWidth,
		customiseHeight,
		customiseRotate,
		customiseFlip,
		customiseInline,
	} from '../../../config/components';
	import {
		ColorBlock,
		SizeBlock,
		RotateBlock,
		FlipBlock,
		InlineBlock,
	} from '../../../config/footer-components';

	// Selected icons
	export let icons: Icon[];

	// Customisations
	export let customisations: IconCustomisations;

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Title
	let title: string;
	$: {
		title = showFooterBlockTitles
			? phrases.footerBlocks[icons.length > 1 ? 'title2' : 'title']
			: '';
	}
</script>

<FooterBlock name="props" {title}>
	<div>
		{#if customiseColor}
			<ColorBlock {icons} value={customisations.color} {customise} />
		{/if}
		{#if customiseWidth || customiseHeight}
			<SizeBlock {icons} {customisations} {customise} />
		{/if}
		{#if customiseFlip}
			<FlipBlock {customisations} {customise} />
		{/if}
		{#if customiseRotate}
			<RotateBlock value={customisations.rotate} {customise} />
		{/if}
		{#if customiseInline && icons.length === 1}
			<InlineBlock value={customisations.inline} {customise} />
		{/if}
	</div>
</FooterBlock>
