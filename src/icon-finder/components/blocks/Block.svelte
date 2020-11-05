<script type="typescript">
	// Block type
	export let type = '';

	// Block name
	export let name = '';

	// Extra class to add
	export let extra = '';

	const baseClass = 'iif-block';
	let className: string;
	$: {
		className = baseClass;
		if (type !== '') {
			let typeBase = ' ' + baseClass + '--' + type;
			className += typeBase;
			if (name !== '') {
				className += typeBase + '--' + name;
			}
		}
		if (extra !== '') {
			className += ' ' + baseClass + '--' + extra;
		}
		// console.log(`Rendering Block at ${Date.now()}: ${className}`);
	}
</script>

<div class={className}>
	<slot />
</div>
