// import svelte from 'rollup-plugin-svelte';
// import resolve from '@rollup/plugin-node-resolve';
// import pkg from './package.json';
// import typescript from '@rollup/plugin-typescript'

// const production = !process.env.ROLLUP_WATCH;
// const name = pkg.name
// 	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
// 	.replace(/^\w/, m => m.toUpperCase())
// 	.replace(/-\w/g, m => m[1].toUpperCase());

// export default {
// 	input: 'lib/main.ts',
// 	output: [
// 		{ file: pkg.module, 'format': 'es' },
// 		{ file: pkg.main, 'format': 'umd', name }
// 	],
// 	plugins: [
// 		svelte(),
// 		resolve(),
// 		typescript({sourceMap: !production,}),
// 	]
// };
