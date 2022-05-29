const { promises: fs } = require('fs');
const {
	IconSet,
	importDirectory,
	runSVGO,
	deOptimisePaths,
} = require('@iconify/tools');

// Load JSON file
async function loadJSON(filename) {
	function cleanup(value) {
		if (typeof value === 'object') {
			if (value === null) {
				return value;
			}

			if (value instanceof Array) {
				return value.map(cleanup).filter((item) => item !== null);
			}

			const newObject = Object.create(null);
			for (const key in value) {
				if (key.slice(0, 2) === '//') {
					continue;
				}
				const newValue = cleanup(value[key]);
				if (newValue !== null) {
					newObject[key] = newValue;
				}
			}
			return newObject;
		}

		if (typeof value === 'string') {
			if (value.slice(0, 2) === '//') {
				return null;
			}
		}

		return value;
	}

	return cleanup(JSON.parse(await fs.readFile(filename)));
}

async function build() {
	// Categories for all icons
	const categories = await loadJSON('./metadata/categories.json');

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
	iconSet.suffixes = await loadJSON('./metadata/suffixes.json');

	// Make sure all icons are present
	for (const name in sortedCategories) {
		const category = sortedCategories[name];
		if (!iconSet.entries[name]) {
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
	const aliasesConfig = await loadJSON('./metadata/aliases.json');
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
	/*
	await iconSet.forEach(async (name, type) => {
		if (type !== 'icon') {
			return;
		}

		const svg = iconSet.toSVG(name);
		await runSVGO(svg);
		await deOptimisePaths(svg);
		iconSet.fromSVG(name, svg);
	});
	*/

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
