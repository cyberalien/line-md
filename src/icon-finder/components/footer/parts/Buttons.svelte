<script lang="typescript">
	import { getContext } from 'svelte';
	import type { Icon, FullRoute } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../../wrapper/registry';
	import type {
		FooterButton,
		FooterButtonCallbackParams,
	} from '../../../footer/types';
	import { phrases } from '../../../config/phrases';
	import { footerButtons } from '../../../config/components';
	import UIIcon from '../../misc/Icon.svelte';

	// Selected icons
	export let icons: Icon[];

	// Current route
	export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Custom properties for buttons
	interface ListItem extends FooterButton {
		key: string;
		className: string;
	}
	const baseClassName = 'iif-form-button';
	const buttonPhrases = phrases.footerButtons;

	/**
	 * Parameters for callback
	 */
	function params(
		key: string,
		button: FooterButton
	): FooterButtonCallbackParams {
		return {
			key,
			button,
			registry,
			icons,
			route,
		};
	}

	/**
	 * Get button text
	 */
	function text(item: ListItem): string {
		if (typeof item.text === 'function') {
			return item.text(params(item.key, item));
		}

		// Text as string
		if (typeof item.text === 'string') {
			return item.text;
		}

		// Use key: test phrases, then capitalize key
		const key = item.key;
		if (typeof buttonPhrases[key] === 'string') {
			return buttonPhrases[key];
		}

		return key
			.split('-')
			.map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
			.join(' ');
	}

	// Change buttons to array, add unique key and generate class name
	const items: ListItem[] = Object.keys(footerButtons).map((key) => {
		const button = footerButtons[key];

		const result: ListItem = {
			...button,
			key,
			className:
				baseClassName +
				(button.type ? ' ' + baseClassName + '--' + button.type : '') +
				(button.icon ? ' ' + baseClassName + '--with-icon' : ''),
		};
		return result;
	});

	// TypeScript guard
	function assertNever(v: never): void {
		//
	}

	let buttons: ListItem[];
	let iconName: string;
	$: {
		const total = icons.length;

		// Filter buttons
		buttons = items.filter((item) => {
			const display = item.display;
			switch (display) {
				case void 0:
				case 'always':
					return true;

				case 'empty':
					return total === 0;

				case 'icons':
					return total > 0;

				case 'one-icon':
					return total === 1;

				case 'many-icons':
					return total > 1;

				default:
					if (typeof display === 'function') {
						return display(params(item.key, item));
					}
					assertNever(display);
			}
		});

		// Get icon name for first icon
		iconName = total > 0 ? iconToString(icons[0]) : 'icon';
	}

	function onClick(button: string) {
		// UIFooterButtonEvent
		registry.callback({
			type: 'button',
			button,
		});
	}
</script>

<div class="iif-footer-buttons">
	{#each buttons as item, i (item.key)}
		<button
			class={item.className}
			on:click|preventDefault={() => onClick(item.key)}>
			{#if item.icon}
				<UIIcon icon={item.icon} />
			{/if}
			{text(item)
				.replace('{icon}', iconName)
				.replace('{count}', icons.length + '')}
		</button>
	{/each}
</div>
