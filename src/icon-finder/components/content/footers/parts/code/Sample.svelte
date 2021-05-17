<script lang="typescript">
	import { phrases } from '../../../../../config/phrases';
	import UIIcon from '../../../../ui/UIIcon.svelte';

	// Code sample to show
	export let content: string;

	const text = phrases.codeSamples;

	// Notice counter
	let notice = 0;

	// Generate class name
	const baseClassName = 'iif-input-sample';
	let className: string = baseClassName;
	$: {
		className =
			baseClassName +
			(notice > 0 ? ' ' + baseClassName + '--with-notice' : '');
	}

	/**
	 * Copy code to clipboard
	 */
	function copy() {
		const node = document.body;
		const textarea = document.createElement('textarea');
		const style = textarea.style;
		textarea.value = content;
		style.position = 'absolute';
		try {
			style.left = window.pageXOffset + 'px';
			style.top = window.pageYOffset + 'px';
		} catch (err) {}
		style.height = '0';
		node.appendChild(textarea);

		textarea.focus();
		textarea.select();

		let copied = false;
		try {
			// Modern way
			if (!document.execCommand || !document.execCommand('copy')) {
				// Ancient way
				interface AncientWindow {
					clipboardData?: {
						setData: (a: string, b: string) => void;
					};
				}
				const w = (window as unknown) as AncientWindow;
				if (w.clipboardData) {
					w.clipboardData.setData('Text', content);
					copied = true;
				}
			} else {
				copied = true;
			}
		} catch (err) {}

		// Remove textarea on next tick
		setTimeout(() => {
			node.removeChild(textarea);
		});

		if (copied) {
			// Show notice
			notice++;

			// Remove notice after 2 seconds
			setTimeout(() => {
				if (notice) {
					notice--;
				}
			}, 2000);
		}
	}
</script>

<div class={className}>
	<div class={baseClassName + '-content'}>{content}</div>
	<a title={text.copy} href="# " on:click|preventDefault={copy}><UIIcon
			icon="clipboard">
			📋
		</UIIcon></a>
	{#if notice > 0}
		<div class={baseClassName + '-notice'}>
			<UIIcon icon="confirm">✓</UIIcon>
			{text.copied}
		</div>
	{/if}
</div>
