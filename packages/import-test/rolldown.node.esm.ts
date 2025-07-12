import rolldown, { type BuildOptions } from 'rolldown'

const buildOpts = {
	input: './src/index.ts',
	output: {
		format: 'esm',
		dir: './dist/rolldown/esm',
		entryFileNames: '[name].mjs',
		sourcemap: true,
	},
	platform: 'node',
} satisfies BuildOptions

async function build() {
	await rolldown.build(buildOpts)
}

build()
