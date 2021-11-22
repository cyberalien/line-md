const { promises: fs } = require('fs');
const { dirname } = require('path');
const { IconSet } = require('@iconify/tools/lib/icon-set/index');
const {
	prepareDirectoryForExport,
} = require('@iconify/tools/lib/export/helpers/prepare');

async function build() {
	const rootDir = dirname(__dirname);
	const source = rootDir + '/line-md.json';
	const target = rootDir + '/svg';

	// Load icon set
	const content = JSON.parse(await fs.readFile(source, 'utf8'));
	const iconSet = new IconSet(content);

	// Normalise and prepare directory
	const dir = await prepareDirectoryForExport({
		target,
		cleanup: true,
	});

	// Export all icons
	const customisations = { height: 'auto' };
	await iconSet.forEach(async (name) => {
		let svg = iconSet.toString(name, customisations);
		if (!svg) {
			return;
		}

		svg = svg.replace(
			'width="',
			'class="iconify iconify--line-md" width="'
		);
		await fs.writeFile(`${target}/${name}.svg`, svg, 'utf8');
		console.log(`Exported ${name}.svg`);
	});
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
