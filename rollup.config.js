import typescript from '@rollup/plugin-typescript';
// import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
const config = require('./build/config');

const outputFile = `${config.output.dir}/${config.output.script}`;

export default [
	{
		input: config.build.script,
		output: {
			sourcemap: true,
			format: 'iife',
			file: outputFile,
		},
		plugins: [
			resolve({
				browser: true,
				extensions: ['.ts', '.js', '.svelte'],
				dedupe: (importee) =>
					importee === 'svelte' || importee.startsWith('svelte/'),
			}),
			svelte({
				preprocess: sveltePreprocess(),
			}),
			typescript({
				sourceMap: true,
			}),
			commonjs(),
		],
		watch: {
			clearScreen: false,
		},
	},
	{
		input: outputFile,
		output: {
			sourcemap: false,
			format: 'iife',
			file: outputFile.replace(/.js$/, '.min.js'),
		},
		plugins: [terser()],
	},
];
