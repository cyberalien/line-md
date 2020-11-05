const fs = require('fs');
const { dirname } = require('path');
const sass = require('node-sass');
const { mkdir } = require('./fs');
const config = require('./config');

/**
 * Build function
 */
function build() {
	// Check configuration
	if (typeof config.build.style !== 'string') {
		return;
	}
	['dir', 'style'].forEach((attr) => {
		if (
			typeof config.output[attr] !== 'string' ||
			!config.output[attr].length
		) {
			throw new Error(
				`Configuration error: output.${attr} is not set or empty. Either set it or remove build.style in build/config.js.`
			);
		}
	});

	// Build
	return new Promise((fulfill, reject) => {
		const file = dirname(__dirname) + '/' + config.build.style;

		sass.render(
			{
				file,
				outputStyle: 'expanded',
				indentType: 'tab',
				indentWidth: 1,
				sourceComments: false,
			},
			(error, result) => {
				if (error) {
					reject(error);
					return;
				}

				const outputDir = dirname(__dirname) + '/' + config.output.dir;
				mkdir(outputDir);
				fs.writeFileSync(
					outputDir + '/' + config.output.style,
					result.css
				);
				console.log(
					`Saved ${config.output.dir}/${config.output.style} (${result.css.length} bytes)`
				);
				fulfill();
			}
		);
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
