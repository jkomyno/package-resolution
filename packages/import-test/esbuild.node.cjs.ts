import esbuild, { type BuildOptions } from 'esbuild'

/**
 * Bundler: `esbuild`
 * Output format: `cjs`
 * Resolves to: `exports.<path>.node`
 */
const buildOpts = {
	format: 'cjs',
	bundle: true,
	entryPoints: ['./src/index.ts'],
	outdir: './dist/esbuild-node/cjs',
	outExtension: {
		'.js': '.cjs',
	},
	sourcemap: true,
	platform: 'node',
	target: 'es2022',

	// Important!
	conditions: ['node', 'require'],
} satisfies BuildOptions

async function build() {
	await esbuild.build(buildOpts)
}

build()
