import path from 'node:path'
import type { Configuration } from 'webpack'

const config = {
	name: 'esm',
	entry: {
		index: path.join(__dirname, './src/index.ts'),
	},
	output: {
		filename: '[name].mjs',
		clean: true,
		path: path.join(__dirname, './dist/webpack/esm'),
		module: true,
	},
	target: 'node20',
	resolve: {
		// conditionNames: ['node', 'import', 'require'],
		extensions: ['.ts', '.js'],
		extensionAlias: {
			'.js': ['.js', '.ts'],
			'.cjs': ['.cjs', '.cts'],
			'.mjs': ['.mjs', '.mts'],
		},
	},
	experiments: {
		outputModule: true,
	},
	module: {
		rules: [
			// Transpile TypeScript
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
} satisfies Configuration

export default config
