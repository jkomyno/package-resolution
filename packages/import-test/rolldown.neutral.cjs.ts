import rolldown, { type BuildOptions } from 'rolldown'

const buildOpts = {
	input: './src/index.ts',
	output: {
		format: 'cjs',
		dir: './dist/rolldown/cjs',
		entryFileNames: '[name].cjs',
		sourcemap: true,
	},
	platform: 'neutral',
} satisfies BuildOptions

async function build() {
	await rolldown.build(buildOpts)
}

build()
