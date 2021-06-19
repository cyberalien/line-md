<script lang="typescript">
	import { calculateSize } from '@iconify/svelte';
	import type { Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import type { IconCustomisations } from '@iconify/search-core/lib/misc/customisations';
	import {
		customiseWidth,
		customiseHeight,
		defaultWidth,
		defaultHeight,
	} from '../../../../../config/components';
	import OptionsBlock from '../OptionsBlock.svelte';
	import SizeInput from './SizeInput.svelte';

	// Data for selected icon
	export let icons: Icon[];

	// Icon customisations
	export let customisations: IconCustomisations;

	// Callback
	export let customise: (
		key: keyof IconCustomisations,
		value: unknown
	) => void;

	// Get customisation type (constants because they cannot be changed at run time)
	const type =
		customiseWidth && customiseHeight
			? 'size'
			: customiseWidth
			? 'width'
			: 'height';

	type Props = 'width' | 'height';
	const props: Props[] =
		customiseWidth && customiseHeight
			? ['width', 'height']
			: [customiseWidth ? 'width' : 'height'];

	const defaultSize = {
		width: defaultWidth,
		height: defaultHeight,
	};

	// Get data
	interface IconData {
		width: number;
		height: number;
		ratio: number;
	}
	let data: IconData;
	$: {
		// Get common width and height
		let width: number = 0;
		let height: number = 0;
		let hasWidth: boolean = true;
		let hasHeight: boolean = true;
		let ratio: number = 1;
		let hasRatio: boolean = true;
		icons.forEach((icon) => {
			if (!hasWidth && !hasHeight) {
				return;
			}
			const name = iconToString(icon);
			const data = Iconify.getIcon?.(name);
			if (!data) {
				return;
			}
			if (!width) {
				// First icon
				width = data.width!;
				height = data.height!;
				ratio = width / height;
				return;
			}

			// Compare
			if (hasWidth && width !== data.width) {
				hasWidth = false;
			}
			if (hasHeight && height !== data.height) {
				hasHeight = false;
			}
			if (hasRatio && data.width! / data.height! !== ratio) {
				hasRatio = false;
			}
		});

		// Set data
		data = {
			width: hasWidth ? width : 0,
			height: hasHeight ? height : 0,
			ratio: hasRatio ? ratio : 0,
		};
	}

	// Get placeholders
	interface Placeholders {
		width: string;
		height: string;
	}
	let placeholders: Placeholders;
	$: {
		placeholders = {
			width: '',
			height: '',
		};

		// Check if icon is rotated
		const rotated = !!(
			customisations.rotate && customisations.rotate % 2 === 1
		);

		// Get placeholder for both sides
		if (data.ratio !== 0) {
			const keys: (keyof Placeholders)[] = ['width', 'height'];
			keys.forEach((key, index) => {
				const altKey = keys[1 - index];
				const placeholderKey = rotated ? altKey : key;

				let size: number | string = '';
				let scale = false;
				const customised2 = customisations[rotated ? key : altKey];
				if (customised2) {
					// Another property is customised, use it for ratio
					size = customised2;
					scale = true;
				} else if (defaultSize[key] !== '') {
					// Use default size, do not scale
					size = defaultSize[key];
				} else if (defaultSize[altKey] !== '') {
					// Use default size for other property
					size = defaultSize[altKey];
					scale = true;
				} else if (data[key]) {
					// Use icon size
					size = data[key];
				}

				// Scale placeholder using size ratio
				// console.log(`Size for ${key} is ${size}`);
				if (size !== '') {
					placeholders[placeholderKey] =
						(scale
							? calculateSize(
									size,
									key === 'width'
										? data.ratio
										: 1 / data.ratio
							  )
							: size) + '';
				}
			});
		}
		// console.log('Placeholders:', JSON.stringify(placeholders));
	}
</script>

<OptionsBlock {type}>
	{#each props as prop, i (prop)}
		<SizeInput
			{prop}
			value={customisations[prop] === null ? '' : customisations[prop] + ''}
			placeholder={placeholders[prop]}
			{customise} />
	{/each}
</OptionsBlock>
