const fs = require('fs');
const path = require('path');

const rootDir = path.dirname(__dirname);

/**
 * Create directory recursively, starting with rootDir
 */
function mkdir(dir) {
	if (dir.slice(0, rootDir.length) !== rootDir) {
		return;
	}
	let current = rootDir;
	const extra = dir.slice(rootDir.length).split('/');
	while (extra.length) {
		try {
			fs.mkdirSync(dir, 0o755);
		} catch (err) {}
		const next = extra.shift();
		if (next !== '') {
			current += '/' + next;
		}
	}
}
exports.mkdir = mkdir;
