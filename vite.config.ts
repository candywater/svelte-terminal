import { defineConfig } from 'vite'
import { resolve } from 'path'
import pkg from './package.json';
import { svelte } from '@sveltejs/vite-plugin-svelte'

// "svelte-terminal" => "Terminal"
const name = pkg.name
    .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
    .replace(/^\w/, m => m.toUpperCase())
    .replace(/-\w/g, m => m[1].toUpperCase());

export default defineConfig({
    plugins: [
        svelte()
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            name: "main.js"
        },
        rollupOptions: {
            output: {
                name: "index"
            }
        }
        // rollupOptions: {
        //     output: {
        //         entryFileNames: [
        //             { file: "dist/index.js", 'format': 'es' },
        //             { file: "dist/index.mjs", 'format': 'umd', name }
        //         ]
        //     },
        // }
    },
})