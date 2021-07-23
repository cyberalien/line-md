<script lang="typescript">
	import type { FullRoute, Icon } from '@iconify/search-core';
	import IconComponent from '@iconify/svelte';
	import { iconToString } from '@iconify/search-core';
	import { canShortenIconName } from '../../../../../config/components';
	import { shortenIconName } from '../../../../../footer/shorten-icon-name';
	import { phrases } from '../../../../../config/phrases';

	// Icon name
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
</script>

<div class="iif-footer-icon-name iif-footer-icon-name--simple">
	<dl>
		<dt>{phrases.footer.iconName}</dt>
		<dd>
			{#each [iconName] as iconName (iconName)}
				<IconComponent icon={iconName} />
			{/each}
			<div class="iif-footer-icon-name-input"><span>{text}</span></div>
		</dd>
	</dl>
</div>
