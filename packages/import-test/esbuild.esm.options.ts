import type { BuildOptions } from 'esbuild'

export const buildOpts = {
	bundle: true,
	sourcemap: true,
	format: 'esm',
	entryPoints: ['./src/index.ts'],
	outExtension: {
		'.js': '.mjs',
	},
	target: 'es2022',
	external: [
		// Avoid errors like `Could not resolve "node:fs/promises"`
		'node:*',
	],
} satisfies BuildOptions
