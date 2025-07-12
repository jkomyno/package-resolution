import type { BuildOptions } from 'rolldown'

export const buildOpts: BuildOptions = {
	input: './src/index.ts',
	output: {
		format: 'cjs',
		dir: './dist/rolldown/esm',
		entryFileNames: '[name].mjs',
		sourcemap: true,
	},
}
