<script lang="typescript">
	import type { IconifyIcon } from '@iconify/svelte';
	import IconComponent from '@iconify/svelte';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { getDimensions } from '../../../../../footer/icon-size';
	import {
		iconSampleSize,
		defaultColor,
		defaultWidth,
		defaultHeight,
	} from '../../../../../config/components';

	// Icon name
	export let icon: Icon;

	// Current customisations
	export let customisations: IconCustomisations;

	const divisions = [2.5, 3, 3.5];

	// Get maximum width/height from options
	const maxWidth = iconSampleSize.width;
	const maxHeight = iconSampleSize.height;

	const minWidth = Math.floor(maxWidth / 2);
	const minHeight = Math.floor(maxHeight / 2);

	/**
	 * Scale sample
	 */
	interface NumericIconDimensions {
		width: number;
		height: number;
	}
	function scaleSample(size: NumericIconDimensions, canScaleUp: boolean) {
		// Scale
		while (size.width > maxWidth || size.height > maxHeight) {
			// Attempt to divide by 2
			let newWidth = size.width / 2;
			let newHeight = size.height / 2;

			if (
				Math.round(newWidth) !== newWidth ||
				Math.round(newHeight) !== newHeight
			) {
				// Try to divide by a different number
				for (let i = 0; i < divisions.length; i++) {
					let div = divisions[i];
					let newWidth2 = size.width / div;
					let newHeight2 = size.height / div;
					if (
						Math.round(newWidth2) === newWidth2 &&
						Math.round(newHeight2) === newHeight2
					) {
						newWidth = newWidth2;
						newHeight = newHeight2;
						break;
					}
				}
			}

			size.width = newWidth;
			size.height = newHeight;
		}

		if (canScaleUp) {
			while (size.width < minWidth && size.height < minHeight) {
				size.width *= 2;
				size.height *= 2;
			}
		}
	}

	// Get icon name, data, check data
	interface IconData {
		name: string;
		data: IconifyIcon;
		rotated: boolean;
		ratio: number;
	}
	let data: IconData;
	$: {
		// Get name
		const name = iconToString(icon);

		// Get data (both getIcon and icon data are available: check is done in footer)
		const iconData = Iconify.getIcon!(name)!;

		// Check if icon is rotated (for width/height calculations)
		const rotated = !!(
			iconData.width !== iconData.height &&
			customisations.rotate &&
			customisations.rotate % 2 === 1
		);

		// Width / height ratio
		const ratio = iconData.width! / iconData.height!;

		data = {
			name,
			data: iconData,
			rotated,
			ratio,
		};
	}

	// Calculate style
	let style: string;
	$: {
		style = '';

		// Add color
		if (customisations.color) {
			style += 'color: ' + customisations.color + ';';
		} else if (defaultColor) {
			style += 'color: ' + defaultColor + ';';
		}

		// Set dimensions
		if (!customisations.width && !customisations.height) {
			// Calculate size
			let size: NumericIconDimensions;

			if (defaultWidth || defaultHeight) {
				size = getDimensions(
					defaultWidth,
					defaultHeight,
					data.ratio,
					data.rotated
				) as NumericIconDimensions;
			} else {
				size = getDimensions(
					data.data.width!,
					data.data.height!,
					data.ratio,
					data.rotated
				) as NumericIconDimensions;
			}

			// Scale
			scaleSample(size, true);
			style += 'font-size: ' + size.height + 'px;';
		}
	}

	// Scale sample
	let props: Partial<IconCustomisations>;
	$: {
		props = {};
		['hFlip', 'vFlip', 'rotate'].forEach((key) => {
			const prop = key as keyof IconCustomisations;
			if (customisations[prop]) {
				(props as Record<string, unknown>)[prop] = customisations[prop];
			}
		});

		let size: NumericIconDimensions | undefined;
		const customisedWidth = customisations.width;
		const customisedHeight = customisations.height;
		if (customisedWidth || customisedHeight) {
			size = getDimensions(
				customisedWidth ? customisedWidth : '',
				customisedHeight ? customisedHeight : '',
				data.ratio,
				data.rotated
			) as NumericIconDimensions;
		} else if (defaultWidth || defaultHeight) {
			size = getDimensions(
				defaultWidth,
				defaultHeight,
				data.ratio,
				data.rotated
			) as NumericIconDimensions;
		}

		if (size !== void 0) {
			scaleSample(size, false);
			props.width = size.width + '';
			props.height = size.height + '';
		}
	}
</script>

<div
	class="iif-foote
	r-sample iif-footer-sample--block iif-footer-sample--loaded"
	{style}>
	{#each [data] as icon (icon.name)}
		<IconComponent icon={icon.name} {...props} />
	{/each}
</div>
