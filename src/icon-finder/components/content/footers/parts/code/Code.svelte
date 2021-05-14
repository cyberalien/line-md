<script lang="typescript">
	import { getContext } from 'svelte';
	import type { Icon } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type {
		CodeSampleAPIConfig,
		CodeSampleMode,
	} from '@iconify/search-core/lib/code-samples/types';
	import type { CodeOutput } from '@iconify/search-core/lib/code-samples/code';
	import {
		getIconCode,
		codeOutputComponentKeys,
	} from '@iconify/search-core/lib/code-samples/code';
	import { capitalize } from '@iconify/search-core/lib/misc/capitalize';
	import { phrases } from '../../../../../config/phrases';
	import type { WrappedRegistry } from '../../../../../wrapper/registry';
	import UIIcon from '../../../../ui/UIIcon.svelte';
	import SampleInput from './Sample.svelte';

	// Selected icon
	export let icon: Icon;

	// Customisations
	export let customisations: IconCustomisations;

	// API provider config
	export let providerConfig: CodeSampleAPIConfig;

	// Mode
	export let mode: CodeSampleMode;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Callback for external link
	const onExternalClick = registry.link;

	// Get text
	const codePhrases = phrases.codeSamples;

	// Get mode specific data and text
	/*
		Actual type: "CodeOutput | null", but Svelte language tools cannot handle nested conditional
		statements in template, so intentionally using wrong type to get rid of warnings.
	*/
	let output: Required<CodeOutput>;
	let docsText: string;
	$: {
		output = getIconCode(
			mode,
			icon,
			customisations,
			providerConfig
		) as Required<CodeOutput>;

		// Get title for docs
		if (output && output.docs) {
			const docsType = output.docs.type;
			docsText = codePhrases.docs[docsType]
				? codePhrases.docs[docsType]!
				: codePhrases.docsDefault.replace(
						'{title}',
						capitalize(docsType)
				  );
		} else {
			docsText = '';
		}
	}
</script>

{#if output}
	{#if output.header}
		{#if output.header.text}
			<p>{output.header.text}</p>
		{/if}
		{#if output.header.code}
			<SampleInput content={output.header.code} />
		{/if}
	{/if}

	{#if codePhrases.intro[mode]}
		<p>{codePhrases.intro[mode]}</p>
	{/if}

	{#if output.iconify}
		<p>{codePhrases.iconify.intro1.replace('{name}', icon.name)}</p>
		<SampleInput content={output.iconify.html} />
		<p>{codePhrases.iconify.intro2}</p>
		<p>{codePhrases.iconify.head}</p>
		<SampleInput content={output.iconify.head} />
	{/if}

	{#if output.raw}
		{#each output.raw as code}
			<SampleInput content={code} />
		{/each}
	{/if}

	{#if output.component}
		{#each codeOutputComponentKeys as key}
			{#if output.component[key]}
				<p>{codePhrases.component[key]}</p>
				<SampleInput content={output.component[key]} />
			{/if}
		{/each}
	{/if}

	{#if output.footer}
		{#if output.footer.text}
			<p>{output.footer.text}</p>
		{/if}
		{#if output.footer.code}
			<SampleInput content={output.footer.code} />
		{/if}
	{/if}

	{#if output.docs}
		<p class="iif-code-docs">
			<UIIcon icon="docs"><span>&raquo;</span></UIIcon>
			<a
				href={output.docs.href}
				on:click={onExternalClick}
				target="_blank">
				{docsText}
				<UIIcon icon="link"><span>&raquo;</span></UIIcon>
			</a>
		</p>
	{/if}
{/if}
