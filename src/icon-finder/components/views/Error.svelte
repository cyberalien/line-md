<script lang="typescript">
	import type { FullRoute } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import { phrases } from '../../config/phrases';
	import Block from '../blocks/Block.svelte';
	import UIIcon from '../misc/Icon.svelte';

	// Registry
	export let registry: WrappedRegistry;

	// Error
	export let error: string;

	// Current route
	export let route: FullRoute | null;

	// Get text and check if can return
	const errorPhrases = phrases.errors;
	let text: string;
	let canReturn: boolean;
	$: {
		canReturn = !!(
			route &&
			(route.type !== 'collections' ||
				route.parent ||
				(route.params && route.params.provider)) &&
			errorPhrases.custom.home !== void 0
		);
		text =
			errorPhrases.custom[error] === void 0
				? errorPhrases.defaultError
				: errorPhrases.custom[error];

		switch (error) {
			case 'not_found':
				text = text.replace(
					'{prefix}',
					route && route.type === 'collection'
						? '"' + route.params.prefix + '"'
						: ''
				);
				break;

			case 'bad_route':
				canReturn = errorPhrases.custom.home !== void 0;
				break;
		}
	}

	function handleReturn() {
		const router = registry.router;
		if (route && route.type === 'collections') {
			// Return to default provider
			router.home('');
		} else {
			router.home();
		}
	}
</script>

{#each [error] as type (type)}
	<Block type="error" extra={'error--' + type}>
		<UIIcon icon={'error-' + type} />
		<p>
			{text}
			{#if canReturn}
				<br />
				<a href="# " on:click|preventDefault={handleReturn}>
					{errorPhrases.custom.home}
				</a>
			{/if}
		</p>
	</Block>
{/each}
