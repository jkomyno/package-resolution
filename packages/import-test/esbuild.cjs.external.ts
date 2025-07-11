import esbuild, { type BuildOptions } from 'esbuild'

// https://esbuild.github.io/api/#platform
const _nodePlatformOpts = {
	//
	platform: 'node',

	// The main fields setting is set to main,module. This means tree shaking will likely not happen for
	// packages that provide both module and main since tree shaking works with ECMAScript modules but not
	// with CommonJS modules.
	mainFields: ['main', 'module'],

	// The conditions setting automatically includes the node condition. This changes how the exports field
	// in package.json files is interpreted to prefer node-specific code.
	// If no custom conditions are configured, the Webpack-specific module condition is also included.
	// The module condition is used by package authors to provide a tree-shakable ESM alternative to a
	// CommonJS file without creating a dual package hazard. You can prevent the module condition from being
	// included by explicitly configuring some custom conditions (even an empty list).
	conditions: ['require', 'node'],

	// When the format is set to cjs but the entry point is ESM, esbuild will add special annotations for any
	// named exports to enable importing those named exports using ESM syntax from the resulting
	// CommonJS file. Node's documentation has more information about node's detection of CommonJS named exports.
	format: 'cjs',
}

/**
 * Bundler: `esbuild`
 * Output format: `cjs`
 * Resolves to: `exports.<path>.node`
 */
const buildOpts = {
	format: 'cjs',
	bundle: true,
	entryPoints: ['./src/index.ts'],
	outdir: './dist/esbuild/cjs-external',
	outExtension: {
		'.js': '.cjs',
	},
	sourcemap: true,
	platform: 'node',
	target: 'es2022',
	external: ['@prisma/client'],

	// implies -> mainFields: ['module', 'main'],
	// The main fields setting is set to browser,module,main but with some additional special behavior:
	// if a package provides module and main entry points but not a browser entry point then main is used
	// instead of module if that package is ever imported using require().
	// This behavior improves compatibility with CommonJS modules that export a function by assigning it
	// to module.exports. If you want to disable this additional special behavior, you can explicitly set
	// the main fields setting to browser,module,main.
	//
	conditions: ['node', 'require'],
} satisfies BuildOptions

async function build() {
	await esbuild.build(buildOpts)
}

if (require.main === module) {
	build()
}
