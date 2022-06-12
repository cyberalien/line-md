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
	// Load SVGs
	const categories = Object.create(null);
	const iconCategories = Object.create(null);
	const iconSet = await importDirectory('svg', {
		prefix: 'line-md',
		includeSubDirs: true,
		keyword: (file, keyword) => {
			const category = file.subdir.split('/').shift();
			if (!category) {
				throw new Error(`Icon is in wrong category: ${file.path}`);
			}
			if (iconCategories[keyword]) {
				throw new Error(
					`Icon ${keyword} is in multiple categories: ${category} and ${iconCategories[keyword]}`
				);
			}
			iconCategories[keyword] = category;
			(categories[category] || (categories[category] = [])).push(keyword);
			return keyword;
		},
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

	// Add categories
	console.log(iconCategories);
	Object.keys(iconCategories).forEach((icon) => {
		iconSet.toggleCategory(icon, iconCategories[icon], true);
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
				const category = iconCategories[name];
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
