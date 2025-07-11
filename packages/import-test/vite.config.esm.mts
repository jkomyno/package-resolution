import type { UserConfig } from 'vite'

/**
 * Bundler: `vite`
 * Output format: `esm`
 * Resolves to: `exports.<path>.import`
 */
export default {
	logLevel: 'silent',
	build: {
		target: 'es2022',
		outDir: './dist/vite/esm',
		sourcemap: true,
		rollupOptions: {
			input: './src/index.ts',
			output: {
				format: 'esm',
				entryFileNames: '[name].mjs',
			},
			external: [
				// Avoid errors like `Could not resolve "node:fs/promises"`
				/^node:.*/,
			],
		},
	},
} satisfies UserConfig
