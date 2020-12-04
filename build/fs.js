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
	const parts = dir.slice(rootDir.length).split('/');
	while (parts.length) {
		try {
			fs.mkdirSync(dir, 0o755);
		} catch (err) {}
		const next = parts.shift();
		if (next !== '') {
			current += '/' + next;
		}
	}
}
exports.mkdir = mkdir;

/**
 * Remove directory recursively
 */
function rmdir(dir) {
	function removeFiles(dir) {
		let files;

		try {
			files = fs.readdirSync(dir);
		} catch (err) {
			return;
		}

		files.forEach((file) => {
			let filename = dir + '/' + file,
				stats = fs.lstatSync(filename);

			if (stats.isDirectory()) {
				removeFiles(filename);

				// Try to remove directory
				try {
					fs.rmdirSync(filename);
				} catch (err) {}
				return;
			}

			if (stats.isFile() || stats.isSymbolicLink()) {
				// Try to remove file
				try {
					fs.unlinkSync(filename);
				} catch (err) {}
				return;
			}
		});
	}

	removeFiles(dir);
	try {
		fs.rmdirSync(dir);
	} catch (err) {}
}
exports.rmdir = rmdir;
