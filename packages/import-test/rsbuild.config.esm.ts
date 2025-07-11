import { defineConfig } from '@rsbuild/core'

export default defineConfig({
	environments: {
		node: {
			source: {
				entry: {
					index: './src/index.ts',
				},
			},
			output: {
				target: 'node',
				distPath: {
					root: './dist/rsbuild',
					js: './esm',
					jsAsync: './esm',
				},
			},
		},
	},
})
