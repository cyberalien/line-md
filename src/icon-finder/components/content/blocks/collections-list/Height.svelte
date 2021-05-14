<script lang="typescript">
	import { onMount } from 'svelte';

	// Text to display
	export let text: string;

	// Display icon only after mounting component to avoid rendering it on SSR
	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	// Paths for characters and scaling
	const unit = 8;

	interface ShapeData {
		paths: string[];
		width: number;
	}

	const shapesData: Record<string, ShapeData> = {
		'0': {
			paths: [
				'M24 68h8c6 0 12 6 12 12v32c0 6-6 12-12 12H16c-6 0-12-6-12-12V80c0-6 5-12 12-12h8z',
			],
			width: 48,
		},
		'1': {
			paths: ['M4 68c6 0 12 6 12 12v44H4h24'],
			width: 32,
		},
		'2': {
			paths: [
				'M4 80c0-6 6-12 12-12h16c6 0 12 6 12 12v8c0 6-6 12-12 12H16c-6 0-12 6-12 12v12h40',
			],
			width: 48,
		},
		'3': {
			paths: [
				'M4 80c0-6 6-12 12-12h16c6 0 12 6 12 12v4c0 6-6 12-12 12h-4 4c6 0 12 6 12 12v4c0 6-6 12-12 12H16c-6 0-12-6-12-12',
			],
			width: 48,
		},
		'4': {
			paths: ['M4 68v20c0 6 6 12 12 12h16c6 0 12-6 12-12V68v56'],
			width: 48,
		},
		'5': {
			paths: [
				'M44 68H4v24h28c6 0 12 6 12 12v8c0 6-6 12-12 12H16c-6 0-12-6-12-12',
			],
			width: 48,
		},
		'6': {
			paths: [
				'M44 80c0-6-6-12-12-12H16c-6 0-12 6-12 12v32c0 6 6 12 12 12h16c6 0 12-6 12-12v-8c0-6-6-12-12-12H16c-6 0-12 6-12 12',
			],
			width: 48,
		},
		'7': {
			paths: ['M4 68h28c6 0 12 6 12 12 0 4-6.667 18.667-20 44'],
			width: 48,
		},
		'8': {
			paths: [
				'M24 68h8c6 0 12 6 12 12v4c0 6-6 12-12 12 6 0 12 6 12 12v4c0 6-6 12-12 12H16c-6 0-12-6-12-12v-4c0-6 6-12 12-12-6 0-12-6-12-12v-4c0-6 6-12 12-12h8z',
			],
			width: 48,
		},
		'9': {
			paths: [
				'M44 88c0 6-6 12-12 12H16c-6 0-12-6-12-12v-8c0-6 6-12 12-12h16c6 0 12 6 12 12v32c0 6-6 12-12 12H16c-6 0-12-6-12-12',
			],
			width: 48,
		},
		'|': {
			paths: [
				// Top arrow
				'M4 48l24-24 24 24',
				// Bottom arrow
				'M4 144l24 24 24-24',
				// Middle line
				'M28 48v96',
			],
			width: 56,
		},
		',': {
			paths: ['M8 124c-2 0-4-2-4-4s2-4 4-4 4 2 4 4v8c0 2-2 6-4 8'],
			width: 16,
		},
		'.': {
			paths: ['M8 116c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4z'],
			width: 16,
		},
	};

	interface IconHeightOptions {
		line?: boolean;
		animate?: boolean;
		height?: number;
	}

	const defaultOptions: Required<IconHeightOptions> = {
		line: false,
		animate: false,
		height: 24,
	};

	function iconHeight(text: string, options?: IconHeightOptions): string {
		let width = unit,
			height = 24 * unit,
			svg = '',
			i: number,
			char: string,
			item: ShapeData,
			scale: number;

		// Convert from number
		if (typeof text === 'number') {
			text = '' + text;
		}

		// Set options
		const allOptions: Required<IconHeightOptions> = Object.assign(
			{},
			defaultOptions,
			typeof options === 'object' ? options : {}
		);

		// Get scale
		scale = height / allOptions.height;

		// Add 1 unit for line
		if (allOptions.line) {
			width += unit;
		}

		// Parse each character
		for (i = 0; i < text.length; i++) {
			char = text.slice(i, i + 1);
			if (shapesData[char] === void 0) {
				if (char === ' ') {
					width += unit * 2;
				}
				continue;
			}
			if (char === '|') {
				// Force line
				allOptions.line = true;
			}

			item = shapesData[char];
			if (width > unit) {
				svg += '<g transform="translate(' + width + ')">';
			}
			item.paths.forEach((path) => {
				svg += '<path d="' + path + '" />';
			});
			if (width > unit) {
				svg += '</g>';
			}

			width += item.width + unit;
		}

		// Add line
		if (allOptions.line) {
			svg +=
				'<path d="M' +
				unit / 2 +
				' ' +
				unit / 2 +
				'h' +
				(width - unit) +
				'" />';
			svg +=
				'<path d="M' +
				unit / 2 +
				' ' +
				(height - unit / 2) +
				'h' +
				(width - unit) +
				'" />';
		}

		// Wrap in group
		svg =
			'<g stroke-width="' +
			unit +
			'" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
			svg +
			'</g>';

		// Wrap in <svg>
		return (
			'<svg xmlns="http://www.w3.org/2000/svg" focusable="false" width="' +
			width / scale +
			'" height="' +
			height / scale +
			'" viewBox="0 0 ' +
			width +
			' ' +
			height +
			'"> ' +
			svg +
			'</svg>'
		);
	}

	// Convert to HTML
	let html: string;
	$: {
		html = iconHeight(text);
	}
</script>

{#if mounted}
	{@html html}
{/if}
