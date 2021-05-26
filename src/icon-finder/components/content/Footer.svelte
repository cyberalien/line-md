<script lang="typescript">
	import { onMount, getContext, onDestroy } from 'svelte';
	import { loadIcons } from '@iconify/svelte';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { mergeCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import type { SelectedIcons } from '../../wrapper/icons';
	import { selectionToArray } from '../../wrapper/icons';
	import type { FullRoute } from '@iconify/search-core';
	import type { WrappedRegistry } from '../../wrapper/registry';

	/**
	 * Various footer components
	 *
	 * Select component you need by changing comments
	 */
	// Full footer
	import Footer from './footers/Full.svelte';

	// Similar to full, but selected icon (or icons list) is above footer, making it look nicer with small width
	// Also when multiple icons are selected, it allows selecting icon from selected icons and shows code/customisations for it
	// import Footer from './footers/Compact.svelte';

	// Simple footer: no big sample
	// import Footer from './footers/Simple.svelte';

	// Empty footer: only buttons
	// import Footer from './footers/Empty.svelte';

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
		// Convert empty width/height to null
		switch (prop) {
			case 'width':
			case 'height':
				if (value === '' || value === 0) {
					value = null;
				}
				break;
		}

		if (customisations[prop] !== void 0 && customisations[prop] !== value) {
			// Change value then change object to force Svelte update components
			const changed = {
				[prop]: value,
			};

			// Send event: UICustomisationEvent
			registry.callback({
				type: 'customisation',
				changed,
				customisations: { ...customisations, ...changed },
			});
		}
	}

	// Event listener
	let mounted = false;
	let updateCounter: number = 0;
	let abortLoader: (() => void) | null = null;
	function loadingEvent() {
		updateCounter++;
	}

	onMount(() => {
		mounted = true;
	});

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
			if (Iconify.getIcon?.(name)) {
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

		// Update pending list and load icons after component is mounted
		pending = newPending;
		if (toLoad.length && mounted) {
			// Load new icons
			if (abortLoader !== null) {
				abortLoader();
			}
			abortLoader = loadIcons(toLoad, loadingEvent);
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
