const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const config = require('./config');

/**
 * Build function
 */
async function build() {
	// Check configuration
	if (typeof config.build.script !== 'string') {
		return;
	}
	['dir', 'script'].forEach((attr) => {
		if (
			typeof config.output[attr] !== 'string' ||
			!config.output[attr].length
		) {
			throw new Error(
				`Configuration error: output.${attr} is not set or empty. Either set it or remove build.script in build/config.js.`
			);
		}
	});

	const rootDir = path.dirname(__dirname);
	const packageJSON = JSON.parse(
		fs.readFileSync(rootDir + '/package.json', 'utf8')
	);
	if (
		typeof packageJSON.scripts !== 'object' ||
		typeof packageJSON.scripts['build:script'] !== 'string'
	) {
		throw new Error(
			`Configuration error: scripts.build:script is not set in package.json. Either add it or change configuration in build/config.js.`
		);
	}

	// Run script
	const result = child_process.spawnSync('npm', ['run', 'build:script'], {
		cwd: rootDir,
		stdio: 'inherit',
	});

	if (result.status !== 0) {
		throw new Error(`Error building script.`);
	}
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
