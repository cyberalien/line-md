<script lang="typescript">
	import type { CollectionInfoBlock } from '@iconify/search-core';
	import type { CollectionInfo } from '@iconify/search-core/lib/converters/collection';
	import { phrases } from '../../config/phrases';
	import Block from './Block.svelte';

	// Block name
	export let name: string;

	// Block data
	export let block: CollectionInfoBlock;

	const text = phrases.collectionInfo;

	// Split info into a separate object
	let info: CollectionInfo | null;
	$: {
		info = block.info;
	}
</script>

{#if false}
	<Block type="collection-info" extra={name}>
		<div class="iif-collection-info-title">{info.name}</div>
		{#if info.author}
			<dl>
				<dt>{text.author}</dt>
				<dd>
					{#if info.author.url}
						<a
							href={info.author.url}
							target="_blank">{info.author.name}</a>
					{:else}{info.author.name}{/if}
				</dd>
			</dl>
		{/if}
		{#if info.license}
			<dl>
				<dt>{text.license}</dt>
				<dd>
					{#if info.license.url}
						<a
							href={info.license.url}
							target="_blank">{info.license.title}</a>
					{:else}{info.license.title}{/if}
				</dd>
			</dl>
		{/if}
		<dl>
			<dt>{text.total}</dt>
			<dd>{info.total}</dd>
		</dl>
		{#if info.height}
			<dl>
				<dt>{text.height}</dt>
				<dd>
					{typeof info.height === 'object' ? info.height.join(', ') : info.height}
				</dd>
			</dl>
		{/if}
	</Block>
{/if}
