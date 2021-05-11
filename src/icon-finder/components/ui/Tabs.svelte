<script lang="typescript">
	import { maxIndex } from '../../config/theme';
	import type { Tab } from '../types';
	import UIIcon from './UIIcon.svelte';

	export let tabs: Tab[];
	export let selected: string;
	export let onClick: (key: string) => void;

	const baseClass = 'iif-tabs';
	const baseItemClass = 'iif-tab';

	// Cleaned up tab data
	interface CleanedTab {
		key: string;
		className: string;
		title: string;
		index: number;
		href: string;
		hint?: string;
		icon?: string;
		onClick: () => void;
	}

	// Generated tabs list
	interface TabsList {
		side: 'left' | 'right';
		items: CleanedTab[];
		empty: boolean;
	}

	// Generate tabs list
	let list: TabsList[] = [];
	$: {
		const leftList: CleanedTab[] = [];
		const rightList: CleanedTab[] = [];
		tabs.forEach((tab) => {
			const key = tab.key;
			const index =
				(tab.index === void 0 ? list.length : tab.index) % maxIndex;

			// Generate class name
			const className =
				baseItemClass +
				' ' +
				baseItemClass +
				'--' +
				index +
				(key === selected ? ' ' + baseItemClass + '--selected' : '') +
				(tab.type ? ' ' + baseItemClass + '--' + tab.type : '');

			// Generate item
			const item: CleanedTab = {
				key,
				className,
				title: tab.title,
				index,
				href: tab.href === void 0 ? '# ' : tab.href,
				icon: tab.icon,
				hint: tab.hint,
				onClick:
					tab.onClick === void 0 ? () => onClick(key) : tab.onClick,
			};

			if (tab.right) {
				rightList.push(item);
			} else {
				leftList.push(item);
			}
		});

		list = [
			{
				side: 'left',
				items: leftList,
				empty: !leftList.length,
			},
			{
				side: 'right',
				items: rightList,
				empty: !rightList.length,
			},
		];
	}
</script>

<div class={baseClass}>
	{#each list as listItem, i (listItem.side)}
		{#if !listItem.empty}
			<div class={baseClass + '-' + listItem.side}>
				{#each listItem.items as tab, j (tab.key)}
					<a
						href={tab.href}
						class={tab.className}
						title={tab.hint}
						on:click|preventDefault={tab.onClick}>
						{#if tab.icon}
							<UIIcon icon={tab.icon} />
						{/if}
						{#if tab.title !== ''}{tab.title}{/if}
					</a>
				{/each}
			</div>
		{/if}
	{/each}
</div>
