<script lang="typescript">
	import { onMount } from 'svelte';
	import UIIcon from './UIIcon.svelte';

	// Placeholder text
	export let placeholder: string = '';

	// Hint
	export let title: string = '';

	// Default value
	export let value: string = '';

	// True if input should be disabled
	export let disabled: boolean = false;

	// Optional icon to show before input
	export let icon: string = '';

	// Values to add extra classes for styling
	export let type: string = '';
	export let extra: string = '';

	// Callback to call when value has changed
	export let onInput: ((value: string) => void) | null = null;

	// Callback to call when input loses focus
	export let onBlur: ((value: string) => void) | null = null;

	// True if input should automatically focus
	export let autofocus: boolean = false;

	// Icon status
	let hasIcon: boolean = false;
	function iconLoaded() {
		hasIcon = true;
	}

	// Base class name
	const baseClass = 'iif-input';

	// Get wrapper class name
	let wrapperClassName: string;
	$: {
		wrapperClassName = baseClass + '-wrapper';
		// Add states
		wrapperClassName +=
			// Content?
			' ' +
			wrapperClassName +
			(value === '' ? '--empty' : '--has-content') +
			// Disabled
			(disabled ? ' ' + wrapperClassName + '--disabled' : '');
	}

	// Get container class name
	let className: string;
	$: {
		className =
			baseClass +
			// Placeholder
			' ' +
			baseClass +
			'--with' +
			(placeholder === '' ? 'out' : '') +
			'-placeholder' +
			// Icon
			(hasIcon ? ' ' + baseClass + '--with-icon' : '') +
			// Type
			(type !== '' ? ' ' + baseClass + '--' + type : '') +
			// Disabled
			(disabled ? ' ' + baseClass + '--disabled' : '');
	}

	// Get icon style
	let iconStyle: string;
	$: {
		iconStyle = '';
		if (type === 'color' && extra !== '') {
			iconStyle = 'opacity: 1; color: ' + extra;
		}
	}

	// Reset value
	function resetValue() {
		value = '';
		handleInput();
	}

	// on:input binding as onInput
	function handleInput() {
		if (onInput) {
			onInput(value);
		}
	}

	// on:blur binding as onBlur
	function handleBlur() {
		if (onBlur) {
			onBlur(value);
		}
	}

	// Focus
	let inputRef: HTMLElement;
	let mounted = false;
	onMount(() => {
		mounted = true;
		if (autofocus) {
			inputRef.focus();
		}
	});
</script>

<div class={wrapperClassName}>
	<div class={className}>
		{#if mounted && icon !== ''}
			<div class="iif-input-icon" style={iconStyle}>
				<UIIcon {icon} onLoad={iconLoaded} />
			</div>
		{/if}
		<input
			type="text"
			title={title ? title : placeholder}
			bind:value
			on:input={handleInput}
			on:blur={handleBlur}
			spellcheck={false}
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			{disabled}
			bind:this={inputRef} />
		{#if mounted && value === '' && placeholder !== ''}
			<div class="iif-input-placeholder">{placeholder}</div>
		{/if}
		{#if mounted && value !== ''}
			<a
				class="iif-input-reset"
				href="# "
				on:click|preventDefault={resetValue}>
				<UIIcon icon="reset">x</UIIcon>
			</a>
		{/if}
	</div>
</div>
