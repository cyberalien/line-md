<script lang="typescript">
	import { getContext } from 'svelte';
	import Icon from '@iconify/svelte';
	import { getProvider } from '@iconify/search-core';
	import type { CollectionInfo } from '@iconify/search-core/lib/converters/info';
	import type { WrappedRegistry } from '../../../../wrapper/registry';
	import {
		maxIndex,
		showCollectionAuthorLink,
		collectionClickable,
	} from '../../../../config/theme';
	import { phrases } from '../../../../config/phrases';
	import Height from './Height.svelte';

	const baseClass = 'iif-collection';

	// API provider
	export let provider: string;

	// Prefix
	export let prefix: string;

	// Information
	export let info: CollectionInfo;

	// Callback for click
	export let onClick: (prefix: string) => void;

	// Get registry instance
	const registry = getContext('registry') as WrappedRegistry;

	// on:click event for external links
	const onExternalClick = registry.link;

	// Get link
	let link: string;
	$: {
		const providerData = getProvider(provider);
		if (providerData) {
			link = providerData.links.collection.replace('{prefix}', prefix);
			if (link === '') {
				link = '#';
			}
		} else {
			link = '#';
		}
	}

	// Get container class name
	let className: string;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			'--prefix--' +
			prefix +
			(provider === ''
				? ''
				: ' ' + baseClass + '--provider--' + provider) +
			(collectionClickable ? ' ' + baseClass + '--clickable' : '') +
			(info.index
				? ' ' + baseClass + '--' + (info.index % maxIndex)
				: '');
	}

	// Samples
	const samples = getSamples();
	const samplesHeight = getSamplesHeight();

	// Height
	const height =
		'|' +
		(typeof info.height !== 'object'
			? info.height
			: info.height.join(', '));

	// Block was clicked
	function handleBlockClick(event: MouseEvent) {
		if (collectionClickable) {
			event.preventDefault();
			onClick(prefix);
		}
	}

	function getSamplesHeight() {
		if (info.displayHeight) {
			return info.displayHeight;
		} else if (typeof info.height === 'number') {
			return info.height;
		}
		return 0;
	}

	function getSamples() {
		if (info.samples instanceof Array) {
			return info.samples.slice(0, 3);
		}
		return [];
	}
</script>

<li class={className} on:click={handleBlockClick}>
	<div class="iif-collection-text">
		<a href={link} on:click|preventDefault={() => onClick(prefix)}>
			{info.name}
		</a>
		{#if info.author}
			<small>
				{phrases.collection.by}
				{#if showCollectionAuthorLink && info.author.url}
					<a
						href={info.author.url}
						on:click={onExternalClick}
						target="_blank">{info.author.name}</a>
				{:else}{info.author.name}{/if}
			</small>
		{/if}
	</div>
	<div class="iif-collection-data">
		{#if samples.length > 0}
			<div
				class="iif-collection-samples{samplesHeight ? ' iif-collection-samples--' + samplesHeight : ''}">
				{#each samples as sample}
					<Icon
						class="iconify"
						icon={(provider === '' ? '' : '@' + provider + ':') + prefix + ':' + sample} />
				{/each}
			</div>
		{/if}
		{#if info.height}
			<div class="iif-collection-height">
				<Height text={height} />
			</div>
		{/if}
		<div class="iif-collection-total">
			<Height text={info.total + ''} />
		</div>
	</div>
</li>
