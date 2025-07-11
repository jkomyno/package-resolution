import { cloudflare } from '@cloudflare/vite-plugin'
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
		outDir: './dist/vite-cloudlare/esm',
		sourcemap: true,
		rollupOptions: {
			input: './src/index.ts',
			output: {
				format: 'esm',
				entryFileNames: '[name].mjs',
			},
		},
	},
	plugins: [
		cloudflare({
			configPath: './wrangler.jsonc',
		}),
	],
} satisfies UserConfig
