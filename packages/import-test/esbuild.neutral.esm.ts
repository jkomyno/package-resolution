import esbuild, { type BuildOptions } from 'esbuild'

/**
 * Bundler: `esbuild`
 * Output format: `esm`
 * Resolves to: `exports.<path>.import`
 */
const buildOpts = {
	format: 'esm',
	bundle: true,
	entryPoints: ['./src/index.ts'],
	outdir: './dist/esbuild-neutral/esm',
	outExtension: {
		'.js': '.mjs',
	},
	sourcemap: true,
	platform: 'neutral',
	target: 'es2022',
} satisfies BuildOptions

async function build() {
	await esbuild.build(buildOpts)
}

build()
