<script lang="typescript">
	import type { UITranslationAddForm } from '../../phrases/types';
	import Input from './Input.svelte';
	import UIIcon from './UIIcon.svelte';

	// Phrases
	export let phrases: UITranslationAddForm;

	// Show icon in button?
	export let buttonIcon: boolean = false;

	// Icon to show for input
	export let inputIcon: string = '';

	// Default value
	export let value: string;

	// Callback
	export let onSubmit: (value: string) => void;

	// Value validation callback
	export let onValidate: ((value: string) => boolean) | null = null;

	// Status to show
	export let status: string = '';

	// Validate value
	let valid: boolean;
	$: {
		valid = validateValue(value);
	}

	// Get class for button
	let buttonClass: string;
	$: {
		buttonClass =
			'iif-form-button iif-form-button--primary' +
			(buttonIcon ? ' iif-form-button--with-icon' : '');
	}

	/**
	 * Validate current value
	 */
	function validateValue(value: string): boolean {
		if (typeof onValidate === 'function') {
			return onValidate(value);
		}
		return true;
	}

	/**
	 * Submit form
	 */
	function submitForm() {
		onSubmit(value);
	}
</script>

<div class="iif-block--add-form">
	{#if phrases.title}
		<div class="iif-block--add-form-title">{phrases.title}</div>
	{/if}
	<form
		on:submit|preventDefault={submitForm}
		class="iif-block--add-form-form">
		<Input
			type="text"
			bind:value
			placeholder={phrases.placeholder}
			icon={inputIcon} />
		<button class={buttonClass} type="submit">
			{#if buttonIcon}
				<UIIcon icon="plus" />
			{/if}
			{phrases.submit}
		</button>
	</form>
	{#if status}
		<div class="iif-block--add-form-status">{status}</div>
	{/if}
	{#if !valid && phrases.invalid}
		<div class="iif-block--add-form-invalid">{phrases.invalid}</div>
	{/if}
</div>
