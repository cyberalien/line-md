<script lang="typescript">
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import { phrases } from '../../../../config/phrases';
	import { iconSampleSize } from '../../../../config/components';

	// Icon
	export let icon: Icon;

	// Current customisations
	export let customisations: IconCustomisations;

	const samplePhrases = phrases.footer.inlineSample;

	// Get maximum width/height from options
	const maxWidth = iconSampleSize.width;
	const maxHeight = iconSampleSize.height;

	// Get HTML
	let html: string;
	let style: string;
	$: {
		const iconName = iconToString(icon);
		const props: Record<string, unknown> = {};

		// Show placeholder if renderPlaceholder() exists
		const isPlaceholder = Iconify.renderPlaceholder;
		style = '';
		Object.keys(customisations).forEach((key) => {
			const attr = key as keyof IconCustomisations;
			const value = customisations[attr];
			if (value !== '' && value !== 0 && value !== false) {
				if (attr === 'color') {
					style = 'color: ' + value;
				} else {
					props[attr] = value;
				}
			}
		});

		// Adjust width and height
		if (props.width || props.height) {
			const rotated = !!(customisations.rotate % 2);

			// Check maxWidth
			let key = rotated ? 'height' : 'width';
			if (props[key] && (props[key] as number) > maxWidth) {
				props[key] = maxWidth;
			}

			// Check maxHeight
			key = !rotated ? 'height' : 'width';
			if (props[key] && (props[key] as number) > maxHeight) {
				props[key] = maxHeight;
			}
		}

		const code = Iconify.renderPlaceholder
			? Iconify.renderPlaceholder(iconName, props)
			: Iconify.renderHTML
			? Iconify.renderHTML(iconName, props)
			: null;
		html = code === null ? '' : code;
	}
</script>

<div
	class="iif-footer-sample iif-footer-sample--inline iif-footer-sample--loaded">
	<p>
		{samplePhrases.before}
		<span {style}>{@html html}</span>
		{samplePhrases.after}
	</p>
</div>
