<script lang="typescript">
	import IconComponent from '@iconify/svelte';
	import type { IconProps } from '@iconify/svelte';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { phrases } from '../../../../../config/phrases';
	import { iconSampleSize } from '../../../../../config/components';

	// Icon
	export let icon: Icon;

	// Current customisations
	export let customisations: IconCustomisations;

	const samplePhrases = phrases.footer.inlineSample;

	// Get maximum width/height from options
	const maxWidth = iconSampleSize.width;
	const maxHeight = iconSampleSize.height;

	// Get HTML
	let props: IconProps;
	let style: string;
	$: {
		props = {
			icon: iconToString(icon),
		};
		style = '';

		// Customisations
		Object.keys(customisations).forEach((key) => {
			const attr = key as keyof IconCustomisations;
			const value = customisations[attr];
			if (
				value !== void 0 &&
				value !== '' &&
				value !== 0 &&
				value !== false
			) {
				if (attr === 'color') {
					style = 'color: ' + value + ';';
				} else {
					((props as unknown) as Record<string, unknown>)[
						attr
					] = value;
				}
			}
		});

		// Adjust width and height
		if (props.width || props.height) {
			const rotated = !!(customisations.rotate % 2);

			// Check maxWidth
			let key: keyof IconProps = rotated ? 'height' : 'width';
			if (props[key] && (props[key] as number) > maxWidth) {
				props[key] = maxWidth;
			}

			// Check maxHeight
			key = !rotated ? 'height' : 'width';
			if (props[key] && (props[key] as number) > maxHeight) {
				props[key] = maxHeight;
			}
		}
	}
</script>

<div
	class="iif-footer-sample iif-footer-sample--inline iif-footer-sample--loaded">
	<p>
		{samplePhrases.before}
		<span {style}><IconComponent {...props} /></span>
		{samplePhrases.after}
	</p>
</div>
