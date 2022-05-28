const { promises: fs } = require('fs');
const {
	IconSet,
	importDirectory,
	runSVGO,
	deOptimisePaths,
} = require('@iconify/tools');

// Legacy icons that are no longer in set
const legacyIcons = new Set(['iconify2']);

// Categories for all icons
const categories = {
	Arrows: [
		'arrow-left',
		'arrow-small-left',
		'arrow-left-circle',
		'arrow-left-circle-twotone',
		'chevron-left',
		'chevron-left-circle',
		'chevron-left-circle-twotone',
		'chevron-double-left',
		'chevron-triple-left',
		'chevron-small-left',
		'chevron-small-double-left',
		'chevron-small-triple-left',
		'arrow-open-left',
		'arrow-close-left',
		'arrows-horizontal',
		'arrows-horizontal-alt',
		'double-arrow-horizontal',
		'navigation-left-up',
		'navigation-left-down',
		'navigation-right-up',
		'navigation-right-down',
		'arrows-diagonal',
		'arrow-long-diagonal',
	],
	Alerts: [
		'alert',
		'alert-twotone',
		'alert-circle',
		'alert-circle-twotone',
		'question',
		'question-circle',
		'question-circle-twotone',
		'bell',
		'bell-twotone',
	],
	Editing: [
		'grid-3',
		'grid-3-twotone',
		'grid-3-solid',
		'list-3',
		'list-3-twotone',
		'list-3-solid',
		'list',
		'list-indented',
		'check-list-3',
		'check-list-3-twotone',
		'check-list-3-solid',
		'paint-drop',
		'paint-drop-half-filled',
		'paint-drop-half-twotone',
		'paint-drop-half-filled-twotone',
		'paint-drop-filled',
		'paint-drop-twotone',
		'rotate-270',
		'rotate-180',
		'rotate-90',
		'align-center',
		'align-justify',
		'align-left',
		'valign-baseline',
		'valign-baseline-twotone',
		'valign-middle',
		'valign-middle-twotone',
		'valign-top',
		'valign-top-twotone',
		'valign-bottom',
		'valign-bottom-twotone',
		'arrow-align-left',
		'arrow-align-center',
		'edit',
		'edit-twotone',
		'edit-twotone-full',
		'pencil',
		'pencil-twotone',
		'pencil-twotone-alt',
		'marker',
		'marker-twotone',
		'marker-filled',
		'clipboard',
		'clipboard-twotone',
		'clipboard-check',
		'clipboard-check-twotone',
		'clipboard-plus',
		'clipboard-plus-twotone',
		'clipboard-minus',
		'clipboard-minus-twotone',
		'clipboard-list',
		'clipboard-list-twotone',
		'clipboard-arrow',
		'clipboard-arrow-twotone',
		'document',
		'document-twotone',
		'document-add',
		'document-add-twotone',
		'document-remove',
		'document-remove-twotone',
		'document-list',
		'document-list-twotone',
		'document-code',
		'document-code-twotone',
		'document-report',
		'document-report-twotone',
		'image',
		'image-twotone',
	],
	Interface: [
		'search',
		'search-twotone',
		'search-filled',
		'remove',
		'close',
		'close-circle',
		'close-circle-twotone',
		'confirm',
		'confirm-circle',
		'confirm-circle-twotone',
		'plus',
		'plus-circle',
		'plus-circle-twotone',
		'minus',
		'minus-circle',
		'minus-circle-twotone',
		'circle',
		'circle-twotone',
		'cancel',
		'cancel-twotone',
		'construction',
		'construction-twotone',
		'loading-loop',
		'loading-twotone-loop',
	],
	Navigation: [
		'home-md',
		'home-md-twotone',
		'home-md-twotone-alt',
		'home',
		'home-twotone',
		'home-twotone-alt',
		'home-simple',
		'home-simple-twotone',
		'home-simple-filled',
		'external-link',
		'external-link-rounded',
		'hash',
		'hash-small',
		'menu-unfold-left',
		'menu-unfold-right',
		'menu-fold-left',
		'menu-fold-right',
		'menu',
		'calendar',
		'calendar-out',
	],
	Emoji: [
		'emoji-smile',
		'emoji-smile-twotone',
		'emoji-grin',
		'emoji-grin-twotone',
		'emoji-smile-wink',
		'emoji-smile-wink-twotone',
		'emoji-neutral',
		'emoji-neutral-twotone',
		'emoji-frown',
		'emoji-frown-twotone',
		'emoji-frown-open',
		'emoji-frown-open-twotone',
		'emoji-angry',
		'emoji-angry-twotone',
	],
	Social: [
		'linkedin',
		'twitter',
		'twitter-twotone',
		'facebook',
		'github',
		'github-twotone',
		'github-loop',
		'discord',
		'discord-twotone',
		'heart',
		'heart-twotone',
		'heart-twotone-half',
		'heart-filled',
		'heart-filled-half',
		'heart-twotone-half-filled',
		'heart-half',
		'heart-half-twotone',
		'heart-half-filled',
		'thumbs-up',
		'thumbs-up-twotone',
		'thumbs-down',
		'thumbs-down-twotone',
		'iconify1',
		'email',
		'email-twotone',
		'email-twotone-alt',
		'email-opened',
		'email-opened-twotone',
		'email-opened-twotone-alt',
	],
	Technology: [
		'cloud',
		'cloud-twotone',
		'cloud-filled',
		'cloud-down',
		'cloud-down-twotone',
		'cloud-up',
		'cloud-up-twotone',
		'computer',
		'computer-twotone',
		'laptop',
		'laptop-twotone',
	],
	Account: [
		'account',
		'account-small',
		'account-add',
		'account-remove',
		'account-delete',
		'account-alert',
	],
};

// Sort categories
const sortedCategories = Object.create(null);
for (const title in categories) {
	categories[title].forEach((name) => {
		if (sortedCategories[name]) {
			console.error(
				`Multiple categories for ${name}: ${title} and ${sortedCategories[name]}`
			);
		}
		sortedCategories[name] = title;
	});
}

// Config for generating aliases
const aliasesConfig = [
	{
		icons: [
			'arrow-left',
			'arrow-small-left',
			'arrow-left-circle',
			'arrow-left-circle-twotone',
			'chevron-left',
			'chevron-left-circle',
			'chevron-left-circle-twotone',
			'chevron-double-left',
			'chevron-triple-left',
			'chevron-small-left',
			'chevron-small-double-left',
			'chevron-small-triple-left',
			'arrow-open-left',
			'arrow-close-left',
		],
		search: '-left',
		aliases: [
			{
				replace: '-right',
				changes: {
					hFlip: true,
				},
			},
			{
				replace: '-down',
				changes: {
					rotate: 3,
				},
			},
			{
				replace: '-up',
				changes: {
					rotate: 3,
					hFlip: true,
				},
			},
		],
	},
	{
		icons: ['align-left', 'navigation-left-up'],
		search: '-left',
		replace: '-right',
		changes: {
			hFlip: true,
		},
	},
	{
		icons: ['arrow-align-left'],
		search: '-left',
		aliases: [
			{
				replace: '-right',
				changes: {
					hFlip: true,
				},
			},
			{
				replace: '-bottom',
				changes: {
					rotate: 3,
				},
			},
			{
				replace: '-top',
				changes: {
					rotate: 3,
					hFlip: true,
				},
			},
		],
	},
	{
		icons: ['arrow-align-center'],
		search: '-center',
		replace: '-middle',
		changes: {
			rotate: 3,
		},
	},
	{
		icons: ['arrows-diagonal', 'arrow-long-diagonal'],
		append: '-rotated',
		changes: {
			hFlip: true,
		},
	},
	{
		icons: [
			'arrows-horizontal',
			'arrows-horizontal-alt',
			'double-arrow-horizontal',
		],
		search: '-horizontal',
		replace: '-vertical',
		changes: {
			rotate: 1,
		},
	},
	{
		icons: ['navigation-left-up'],
		search: '-left-up',
		aliases: [
			{
				replace: '-left-down',
				changes: {
					vFlip: true,
				},
			},
			{
				replace: '-right-up',
				changes: {
					hFlip: true,
				},
			},
			{
				replace: '-right-down',
				changes: {
					rotate: 2,
				},
			},
		],
	},
];

async function build() {
	// Load SVGs
	const iconSet = await importDirectory('svg', {
		prefix: 'line-md',
		includeSubDirs: false,
	});
	iconSet.info = {
		name: 'Material Line Icons',
		author: {
			name: 'Vjacheslav Trushkin',
			url: 'https://github.com/cyberalien/line-md',
		},
		license: {
			title: 'MIT',
			spdx: 'MIT',
			url: 'https://github.com/cyberalien/line-md/blob/master/license.txt',
		},
		height: 24,
		samples: ['home', 'edit-twotone', 'image-twotone'],
	};
	iconSet.suffixes = {
		'': 'Fade In',
		'out': 'Fade Out',
		'loop': 'Loop',
		// 'transition': 'Transition',
	};

	// Make sure all icons are present
	for (const name in sortedCategories) {
		const category = sortedCategories[name];
		if (!iconSet.entries[name] && !legacyIcons.has(name)) {
			throw new Error(
				`Missing icon "${name}", supposed to be in category "${category}"`
			);
		}
		iconSet.toggleCategory(name, category, true);
	}

	// Validate categories
	iconSet.forEach((name, type) => {
		if (type !== 'icon') {
			return;
		}

		// Find category
		if (!sortedCategories[name]) {
			console.error(`Missing category for "${name}"`);
		}
	});

	// Add aliases
	aliasesConfig.forEach((item) => {
		const search = item.search;

		item.icons.forEach((name) => {
			const entry = iconSet.entries[name];
			if (!entry || entry.type !== 'icon') {
				throw new Error(`Cannot transform missing icon: "${name}"`);
			}
			if (search && name.indexOf(search) === -1) {
				throw new Error(
					`Cannot rename icon "${name}": expected to find "${search}"`
				);
			}

			(item.aliases || [item]).forEach(({ replace, append, changes }) => {
				if (!search && !append) {
					throw new Error('Missing search or append');
				}
				const newName = search ? name.replace(search, replace) : name + append;

				// Make sure icon does not exist
				const entry = iconSet.entries[newName];
				if (entry) {
					if (entry.type !== 'icon') {
						throw new Error(
							`Cannot rename icon "${name}" to "${newName}": variation already exists`
						);
					}
					return;
				}

				// Add icon and category
				iconSet.setVariation(newName, name, changes);
				const category = sortedCategories[name];
				if (category) {
					iconSet.toggleCategory(newName, category, true);
				}
			});
		});
	});

	// Clean up icons
	await iconSet.forEach(async (name, type) => {
		if (type !== 'icon') {
			return;
		}

		const svg = iconSet.toSVG(name);
		await runSVGO(svg);
		await deOptimisePaths(svg);
		iconSet.fromSVG(name, svg);
	});

	// Export
	const exported = iconSet.export();
	const info = exported.info;
	console.log(`Exported ${info.total} icons`);
	await fs.writeFile('line-md.json', JSON.stringify(exported, null, '\t'));
}

/**
 * Export or build
 */
if (!module.parent) {
	build().catch((err) => {
		console.error(err);
	});
} else {
	module.exports = build;
}
