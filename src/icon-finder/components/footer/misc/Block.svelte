<script lang="typescript">
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import { canToggleFooterBlocks } from '../../../config/components';
	import UIIcon from '../../misc/Icon.svelte';

	// Registry
	export let registry: WrappedRegistry;

	// Config key for expanding
	export let name: string;

	// Title
	export let title: string;

	// Config key
	let key = name + 'Visible';

	// Get config
	const config = (registry.config.components as unknown) as Record<
		string,
		boolean
	>;

	// Check if block can expand
	const canExpand = canToggleFooterBlocks && typeof config[key] === 'boolean';

	// Check if info block is visible
	let expanded: boolean = canExpand && title !== '' ? config[key] : true;

	// Class name
	const baseClass = 'iif-footer-block';
	let className: string;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			'--' +
			name +
			' ' +
			baseClass +
			'--' +
			(expanded ? 'expanded' : 'collapsed');
	}

	/**
	 * Toggle block
	 */
	function toggle() {
		expanded = config[key] = !expanded;
		registry.callback({
			type: 'config',
		});
	}
</script>

<div class={className}>
	{#if title !== ''}
		<p class="iif-footer-block-title">
			{#if !expanded}
				<UIIcon icon="expand" />
			{/if}
			{#if canExpand}
				<a
					href="# "
					on:click|preventDefault={toggle}>{title + (expanded ? ':' : '')}</a>
			{:else}{title + ':'}{/if}
		</p>
	{/if}
	{#if expanded}
		<slot />
	{/if}
</div>
