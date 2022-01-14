import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';
import preprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

const svelte_plugins = [
	svelte({
		preprocess: preprocess({ sourceMap: !production })
	}),
	commonjs(),
	typescript({
		sourceMap: !production,
		inlineSources: !production
	}),
	resolve({
		browser: true
	})
]

export default [{
	input: 'src/index.ts',
	output: [
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name },
	],
	plugins: svelte_plugins
},
{
	input: 'src/demo.ts',
	output: [{
		file: "docs/build/bundle.js",
		sourcemap: true,
		format: 'iife',
		name: 'app'
	}],
	plugins: svelte_plugins
}
];
