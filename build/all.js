const buildScript = require('./script');
const buildStyle = require('./style');
const buildSVG = require('./svg');

// Build stuff
(async () => {
	// Build script
	await buildScript();

	// Build stylesheet
	await buildStyle();

	// Build SVG
	await buildSVG();
})();
