import type { UserConfig } from 'vite'

/**
 * Bundler: `vite`
 * Output format: `esm`
 * Resolves to: `exports.<path>.require`
 */
export default {
	logLevel: 'silent',
	build: {
		target: 'es2022',
		outDir: './dist/vite/cjs',
		sourcemap: true,
		rollupOptions: {
			input: './src/index.ts',
			output: {
				format: 'cjs',
				entryFileNames: '[name].cjs',
			},
			external: [
				// Avoid errors like `Could not resolve "node:fs/promises"`
				/^node:.*/,
			],
		},
	},

	// // Needed to load `exports.<path>.require`.
	// // Without this, it resolve to `exports.<path>.import`.
	resolve: {
		conditions: ['require'],
	},
} satisfies UserConfig
