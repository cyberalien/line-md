<script lang="typescript">
	import { phrases } from '../../../../config/phrases';

	// Block type
	export let type: string;

	const baseClass = 'iif-footer-options-block';

	// Get title
	let title: string;
	$: {
		const text = phrases.footerBlocks;
		title =
			text[type] === void 0
				? type
						.split(' ')
						.map(
							(str) =>
								str.slice(0, 1).toUpperCase() + str.slice(1)
						)
						.join(' ')
				: text[type];
	}
</script>

<div class={baseClass + ' ' + baseClass + '--' + type}>
	<p>{title}</p>
	<div>
		<slot />
	</div>
</div>
