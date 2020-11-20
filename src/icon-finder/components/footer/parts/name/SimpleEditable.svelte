<script lang="typescript">
	import { getContext } from 'svelte';
	import Iconify from '@iconify/iconify';
	import type { FullRoute, Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import { onDestroy } from 'svelte';
	import type { WrappedRegistry } from '../../../../wrapper/registry';
	import { phrases } from '../../../../config/phrases';
	import UIIcon from '../../../misc/Icon.svelte';
	import Input from '../../../forms/Input.svelte';

	// Selected icon
	export let icon: Icon;

	// Current route
	// export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Current value
	let iconName: string;
	let value: string = '';
	let lastIconName: string = '';
	$: {
		iconName = iconToString(icon);

		// Copy icon name if it was changed
		if (lastIconName === '' || lastIconName !== iconName) {
			lastIconName = iconName;
			value = iconName;
		}

		// Check if icon has changed
		if (
			value !== lastIconName &&
			value !== '' &&
			Iconify.iconExists(value)
		) {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: value,
			});
		}
	}

	// Event listener
	let loadingIconName: string = '';
	let abortLoader: (() => void) | null = null;
	const loadingEvent = () => {
		if (
			lastIconName !== loadingIconName &&
			lastIconName !== value &&
			Iconify.iconExists(loadingIconName)
		) {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: loadingIconName,
			});
		}
	};

	// Test new icon name
	function testNewValue() {
		// Check if value is a valid icon name
		if (value.indexOf('-') === -1 && value.indexOf(':') === -1) {
			value = lastIconName;
			return;
		}

		// Check if icon already exists
		if (Iconify.iconExists(value)) {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: value,
			});
			return;
		}

		// Attempt to load icon from API
		loadingIconName = value;
		if (abortLoader !== null) {
			abortLoader();
		}
		abortLoader = Iconify.loadIcons([loadingIconName], loadingEvent);
	}

	// Remove event listener
	onDestroy(() => {
		if (abortLoader !== null) {
			abortLoader();
			abortLoader = null;
		}
	});
</script>

<form
	on:submit|preventDefault={testNewValue}
	class="iif-footer-icon-name iif-footer-icon-name--simple
		iif-footer-icon-name--simple--editable">
	<dl>
		<dt>{phrases.footer.iconName}</dt>
		<dd>
			{#if lastIconName !== ''}
				<UIIcon icon={lastIconName} />
			{/if}
			<Input
				bind:value
				onBlur={testNewValue}
				placeholder={phrases.footer.iconNamePlaceholder} />
		</dd>
	</dl>
</form>
