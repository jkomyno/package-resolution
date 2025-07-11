import path from 'node:path'
import type { Configuration } from 'webpack'

const config = {
	name: 'cjs',
	entry: {
		index: path.join(__dirname, './src/index.ts'),
	},
	output: {
		filename: '[name].cjs',
		path: path.join(__dirname, './dist/webpack/cjs'),
	},
	target: 'node18.18',
	resolve: {
		extensions: ['.js', '.ts'],
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
