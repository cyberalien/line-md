<script lang="typescript">
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { IconifyIconCustomisations } from '@iconify/iconify';
	import { onDestroy } from 'svelte';
	import { icons, iconsClass } from '../../config/theme';

	// Icon to render
	export let icon: string;

	// Customisations
	export let props: IconifyIconCustomisations = {};

	// Function to trigger when icon has been loaded
	// (only triggered if icon required async loading, not triggered on icons that were already loaded)
	export let onLoad: (() => void) | null = null;

	// Local watched variables. Update them only if needed to avoid duplicate re-renders
	// Icon name
	let name: string | null = null;
	// Status
	let loaded: boolean = !!Iconify.renderPlaceholder;
	// SVG
	let svg = '';
	// Dummy variable to trigger re-calculation of other variables when icon has been loaded
	let updateCounter = 0;
	// Callback for loading, used to cancel loading when component is destroyed
	let abortLoader: (() => void) | null = null;

	// Preload icons in component to avoid loading icons one by one. Do not preload for SSR
	if (Iconify.loadIcons && !Iconify.renderPlaceholder) {
		Iconify.loadIcons(
			Object.values(icons).filter((name) => !!name) as string[]
		);
	}

	// Resolve icon name
	$: {
		let newName =
			typeof icons[icon] === 'string'
				? icons[icon]
				: icon.indexOf(':') === -1
				? null
				: icon;
		// console.log('Rendering icon:', icon);

		if (newName !== name) {
			// Update variable only when changed because it is a watched variable
			name = newName;
		}
	}

	// Event listener
	const loadingEvent = () => {
		if (
			name !== null &&
			Iconify.iconExists &&
			Iconify.iconExists(name) &&
			!loaded
		) {
			// Force update
			updateCounter++;
		}
	};

	// Check if icon has been loaded
	$: {
		// Mention updateCounter to make sure this code is ran when updateCounter value is changed
		updateCounter;

		if (name !== null) {
			// Generate placeholder
			if (Iconify.renderPlaceholder) {
				let code = Iconify.renderPlaceholder(
					name,
					typeof props === 'object' ? props : {}
				);
				if (typeof code === 'string') {
					if (iconsClass !== '') {
						code = code.replace(
							' class="',
							' class="' + iconsClass + ' '
						);
					}
					svg = code;
				}
			} else {
				// Generate full icon
				if (
					loaded !== (Iconify.iconExists && Iconify.iconExists(name))
				) {
					// Update variable only if it needs to be updated
					loaded = !loaded;
					if (loaded && typeof onLoad === 'function') {
						onLoad();
					}
				}

				if (!loaded && Iconify.loadIcons) {
					// Icon is not loaded
					if (abortLoader !== null) {
						abortLoader();
					}
					abortLoader = Iconify.loadIcons([name], loadingEvent);
				} else {
					// Icon is loaded - generate SVG
					const iconProps = Object.assign(
						{
							inline: false,
						},
						typeof props === 'object' ? props : {}
					);
					let newSVG =
						loaded && Iconify.renderHTML
							? Iconify.renderHTML(name, iconProps)!
							: (() => {
									// Fake renderHTML that renders placeholder
									let html =
										'<span class="iconify " data-icon="' +
										name +
										'"';
									if (props) {
										let key: keyof typeof props;
										for (key in props) {
											const value = (props as Record<
												string,
												unknown
											>)[key];
											if (value === false) {
												continue;
											}
											switch (key) {
												case 'hFlip':
													if (props.vFlip) {
														html +=
															' data-flip="horizontal,vertical"';
													} else {
														html +=
															' data-flip="horizontal"';
													}
													break;

												case 'vFlip':
													if (!props.hFlip) {
														html +=
															' data-flip="vertical"';
													}
													break;

												default:
													html +=
														' data-' +
														key +
														'="' +
														(value === true
															? 'true'
															: value) +
														'"';
											}
										}
									}
									html += '></span>';
									return html;
							  })();
					if (iconsClass !== '') {
						newSVG = newSVG.replace(
							' class="',
							' class="' + iconsClass + ' '
						);
					}

					// Compare SVG with previous entry to avoid marking 'svg' variable as dirty and causing re-render
					if (newSVG !== svg) {
						svg = newSVG;
					}
				}
			}
		} else if (loaded) {
			// Icon was loaded and is no longer loaded. Icon name changed?
			loaded = false;
		}
	}

	// Remove event listener
	onDestroy(() => {
		if (abortLoader !== null) {
			abortLoader();
			abortLoader = null;
		}
	});
</script>

{#if loaded}
	{@html svg}
{:else}
	<slot />
{/if}
