const buildScript = require('./script');
const buildStyle = require('./style');

// Build stuff
(async () => {
	// Build script
	await buildScript();

	// Build stylesheet
	await buildStyle();
})();
