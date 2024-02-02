import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { IconSet } from '@iconify/tools';

async function build() {
	const outDir = 'svg';

	// Import icon set
	const raw = JSON.parse(await readFile('line-md.json', 'utf-8'));
	const iconSet = new IconSet(raw);

	// Create target directory
	try {
		await mkdir(outDir);
	} catch {
		//
	}

	// Export all icons
	iconSet.forEach(async (name) => {
		const svg = iconSet.toSVG(name);

		// Get content as pretty string with size matching viewBox
		const content = svg.toPrettyString({
			height: 'auto',
		});

		// Write it to file
		const target = `${outDir}/${name}.svg`;
		console.log('Writing', target);
		await writeFile(target, content, 'utf8');
	});
}

await build();
