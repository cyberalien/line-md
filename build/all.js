const buildScript = require('./script');
const buildStyle = require('./style');
const buildAssets = require('./assets');
const buildSVG = require('./svg');

// Build stuff
(async () => {
	// Build script
	await buildScript();

	// Build stylesheet
	await buildStyle();

	// Build line-md stuff
	buildAssets();

	// Build SVG
	await buildSVG();
})();
