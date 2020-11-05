const { dirname } = require('path');
const tools = require('@iconify/tools');

async function build() {
	// Load icon set
	const collection = await tools.ImportJSON(
		dirname(__dirname) + '/line-md.json'
	);

	// Add class to all icons
	collection.keys().forEach((key) => {
		const svg = collection.items[key];
		svg.$svg('svg').attr('class', 'iconify iconify--line-md');
	});

	// Export SVG
	await tools.ExportDir(collection, dirname(__dirname) + '/svg', {
		includePrefix: false,
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
