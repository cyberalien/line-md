<script lang="typescript">
	import IconComponent from '@iconify/svelte';
	import type { FullRoute, Icon } from '@iconify/search-core';
	import { iconToString } from '@iconify/search-core';
	import { Iconify } from '@iconify/search-core/lib/iconify';
	import { canShortenIconName } from '../../../../../config/components';
	import { getIconGrid } from '../../../../../footer/scale-icon';
	import { shortenIconName } from '../../../../../footer/shorten-icon-name';

	// Selected icon
	export let icon: Icon;

	// Current route
	export let route: FullRoute;

	// Get icon name
	let iconName: string;
	let text: string;
	$: {
		// Full name
		iconName = iconToString(icon);

		// Do not show prefix if viewing collection
		text = canShortenIconName
			? shortenIconName(route, icon, iconName)
			: iconName;
	}

	// Get grid
	let grid: number;
	$: {
		const iconData = Iconify.getIcon?.(iconName);
		if (!iconData || !iconData.height) {
			grid = 0;
		} else {
			grid = getIconGrid(iconData.height);
		}
	}

	// Get sample class name
	let className: string;
	$: {
		className = 'iif-footer-small-sample iif-footer-small-sample--' + grid;
	}
</script>

<div class="iif-footer-icon-name iif-footer-icon-name--block">
	<div class={className}>
		<IconComponent icon={iconName} />
	</div>
	<span>{text}</span>
</div>
