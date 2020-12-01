<script lang="typescript">
	import { getContext, onDestroy } from 'svelte';
	import Iconify from '@iconify/iconify';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { mergeCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type { SelectedIcons } from '../../wrapper/icons';
	import { selectionToArray } from '../../wrapper/icons';
	import type { FullRoute } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';
	import { Footer } from '../../config/footer';

	/**
	 * Global exports
	 */
	export let selection: SelectedIcons;
	export let selectionLength: number;
	export let customisations: IconCustomisations;
	export let route: FullRoute;

	// Registry
	const registry = getContext('registry') as WrappedRegistry;

	// Change icon customisation value
	function customise(prop: keyof IconCustomisations, value: unknown) {
		if (
			customisations[prop] !== void 0 &&
			customisations[prop] !== value &&
			typeof customisations[prop] === typeof value
		) {
			// Change value then change object to force Svelte update components
			const changed = {
				[prop]: value,
			};
			const newCustomisations = mergeCustomisations(
				customisations,
				changed
			);

			// Send event: UICustomisationEvent
			registry.callback({
				type: 'customisation',
				changed,
				customisations: newCustomisations,
			});
		}
	}

	// Event listener
	let updateCounter: number = 0;
	let abortLoader: (() => void) | null = null;
	function loadingEvent() {
		updateCounter++;
	}

	// Get list of loaded and pending icons
	let icons: Icon[];
	let pending: string[];
	$: {
		// Mention updateCounter to trigger this code when event listener is used
		updateCounter;

		// Filter icons
		icons = [];
		const newPending: string[] = [];
		const toLoad: string[] = [];

		const list = selectionLength ? selectionToArray(selection) : [];
		list.forEach((icon) => {
			const name = iconToString(icon);
			if (Iconify.iconExists(name)) {
				icons.push(icon);
				return;
			}

			// Icon is missing
			if (abortLoader && pending && pending.indexOf(name) !== -1) {
				// Already pending: do nothing
				newPending.push(name);
				return;
			}

			// Add icon to list of icons to load
			newPending.push(name);
			toLoad.push(name);
		});

		// Update pending list
		pending = newPending;
		if (toLoad.length) {
			// Load new icons
			if (abortLoader !== null) {
				abortLoader();
			}
			abortLoader = Iconify.loadIcons(toLoad, loadingEvent);
		}
	}

	// Remove event listener
	onDestroy(() => {
		if (abortLoader !== null) {
			abortLoader();
		}
	});
</script>

<Footer {icons} {customisations} {route} {customise} />
