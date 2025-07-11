import { afterEach, describe, expect, it } from 'bun:test'
import path from 'node:path'
import { $ as _$ } from 'bun'
import type { BuildOptions as EsbuildOptions } from 'esbuild'

// TODO: why doesn't Bun pick up the cwd into `packages/import-test` automatically when
// running tests within a monorepo?
const cwd = path.join(
	path.dirname(
		// @ts-expect-error: `import.meta.url` is defined in Bun, but is not compatible with
		// `{ "module": "node18" }` in `tsconfig.json`.
		import.meta.url.replace('file://', ''),
	),
	'..',
)

const $ = _$.cwd(cwd)

afterEach(async () => {
	await $`rm -rf ${cwd}/dist`.quiet()
})

describe('Bun', () => {
	it('imports TypeScript files directly, preferably from bun.import', async () => {
		const bunTs = await $`bun run bun:ts`.json()
		expect(bunTs).toEqual({
			client: {
				filename: 'client-bun.ts',
				resolvedFrom: "exports['.'].bun.import",
			},
			index: {
				filename: 'index.mjs',
				resolvedFrom: "exports['.'].import",
			},
			runtime: {
				filename: 'runtime-bun.ts',
				resolvedFrom: "exports['.'].bun.import",
			},
		})
	})
})

describe('Deno', () => {
	it('imports TypeScript files directly, preferably from deno.import', async () => {
		const denoTs = await $`deno run deno:ts`.json()
		expect(denoTs).toEqual({
			client: {
				filename: 'client-deno.ts',
				resolvedFrom: "exports['.'].deno.import",
			},
			index: {
				filename: 'index.mjs',
				resolvedFrom: "exports['.'].import",
			},
			runtime: {
				filename: 'runtime-deno.ts',
				resolvedFrom: "exports['.'].deno.import",
			},
		})
	})
})

const jsRuntimes = [['bun', 'bun']] as [runtime: string, pm: string][]

describe.each(jsRuntimes)('with %s, %s', (jsRuntime, pm) => {
	describe('ESBuild', () => {
		const baseOpts = {
			bundle: true,
			sourcemap: true,
			entryPoints: [path.join(cwd, 'src', 'index.ts')],
			target: 'es2022',
			external: [
				// Avoid errors like `Could not resolve "node:fs/promises"`
				'node:*',
			],
		} satisfies EsbuildOptions

		describe('with CJS', () => {
			// The cjs format stands for "CommonJS" and is intended to be run in node. It assumes the environment contains exports,
			// require, and module. Entry points with exports in ECMAScript module syntax will be converted to a module with a getter
			// on exports for each export name. The cjs format will automatically be enabled when no output format is specified,
			// bundling is enabled, and platform is set to node.
			//
			// See: https://esbuild.github.io/api/#format-commonjs
			const format = 'cjs' as const

			const cjsOpts = {
				...baseOpts,
				format,
				outExtension: {
					'.js': '.cjs',
				},
			} satisfies EsbuildOptions

			describe('with platform="node"', () => {
				// With `format: 'cjs'` and `platform: 'node'`, the default esbuild behavior is to load the following conditions in
				// the exports field of the bundled modules' package.json file:
				// ```js
				// { conditions: ['node', 'module'] }
				// ```
				//
				// See: https://esbuild.github.io/api/#platform
				const platform = 'node' as const

				// Reproduction of: https://github.com/prisma/prisma/issues/27324
				it('by default, CJS loads all from import', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...cjsOpts,
						platform,
						outdir: `${cwd}/dist/esbuild-${platform}/cjs`,
					})

					const esbuildNodeCjs = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/cjs/index.cjs`.json()
					expect(esbuildNodeCjs).toEqual({
						client: {
							filename: 'client.mjs',
							resolvedFrom: "exports['.'].import",
						},
						index: {
							filename: 'index.mjs',
							resolvedFrom: "exports['.'].import",
						},
						runtime: {
							filename: 'runtime-node.mjs',
							resolvedFrom: "exports['.'].node.import",
						},
					})
				})

				// Workaround for: https://github.com/prisma/prisma/issues/27324
				it('with custom conditions, CJS loads runtime from node.require, rest from require', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...cjsOpts,
						platform,
						outdir: `${cwd}/dist/esbuild-${platform}/cjs`,
						conditions: ['require'],
					})

					const esbuildNodeCjsConditions = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/cjs/index.cjs`.json()
					expect(esbuildNodeCjsConditions).toEqual({
						client: {
							filename: 'client.cjs',
							resolvedFrom: "exports['.'].require",
						},
						index: {
							filename: 'index.cjs',
							resolvedFrom: "exports['.'].require",
						},
						runtime: {
							filename: 'runtime-node.cjs',
							resolvedFrom: "exports['.'].node.require",
						},
					})
				})
			})

			describe('with platform="neutral"', () => {
				const platform = 'neutral' as const

				// Expected. Recall that the cjs format is intended to be run on platform=node.
				it('by default, CJS loads all from import', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...cjsOpts,
						platform,
						outdir: `${cwd}/dist/esbuild-${platform}/cjs`,
					})

					const esbuildNodeCjs = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/cjs/index.cjs`.json()
					expect(esbuildNodeCjs).toEqual({
						client: {
							filename: 'client.mjs',
							resolvedFrom: "exports['.'].import",
						},
						index: {
							filename: 'index.mjs',
							resolvedFrom: "exports['.'].import",
						},
						runtime: {
							filename: 'runtime.mjs',
							resolvedFrom: "exports['.'].import",
						},
					})
				})

				it('with custom conditions, CJS loads all from require', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...cjsOpts,
						outdir: `${cwd}/dist/esbuild-${platform}/cjs`,
						platform,
						conditions: ['require'],
					})

					const esbuildNodeCjsConditions = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/cjs/index.cjs`.json()
					expect(esbuildNodeCjsConditions).toEqual({
						client: {
							filename: 'client.cjs',
							resolvedFrom: "exports['.'].require",
						},
						index: {
							filename: 'index.cjs',
							resolvedFrom: "exports['.'].require",
						},
						runtime: {
							filename: 'runtime.cjs',
							resolvedFrom: "exports['.'].require",
						},
					})
				})
			})
		})

		describe('with ESM', () => {
			// The esm format stands for "ECMAScript module". It assumes the environment supports import and export syntax.
			// Entry points with exports in CommonJS module syntax will be converted to a single default export of the value
			// of module.exports. The esm format will automatically be enabled when no output format is specified, bundling
			// is enabled, and platform is set to neutral.
			//
			// See: https://esbuild.github.io/api/#format-esm
			const format = 'esm' as const

			const esmOpts = {
				...baseOpts,
				format,
				outExtension: {
					'.js': '.mjs',
				},
			} satisfies EsbuildOptions

			describe('with platform="node"', () => {
				const platform = 'node' as const

				it('by default, ESM loads runtime from node.import, rest from import', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...esmOpts,
						platform,
						outdir: `${cwd}/dist/esbuild-${platform}/esm`,
					})

					const esbuildNodeEsm = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/esm/index.mjs`.json()
					expect(esbuildNodeEsm).toEqual({
						client: {
							filename: 'client.mjs',
							resolvedFrom: "exports['.'].import",
						},
						index: {
							filename: 'index.mjs',
							resolvedFrom: "exports['.'].import",
						},
						runtime: {
							filename: 'runtime-node.mjs',
							resolvedFrom: "exports['.'].node.import",
						},
					})
				})

				it('with custom conditions, ESM loads runtime from node.import, rest from import', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...esmOpts,
						platform,
						outdir: `${cwd}/dist/esbuild-${platform}/esm`,
						conditions: ['import'],
					})

					const esbuildNodeEsmConditions = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/esm/index.mjs`.json()
					expect(esbuildNodeEsmConditions).toEqual({
						client: {
							filename: 'client.mjs',
							resolvedFrom: "exports['.'].import",
						},
						index: {
							filename: 'index.mjs',
							resolvedFrom: "exports['.'].import",
						},
						runtime: {
							filename: 'runtime-node.mjs',
							resolvedFrom: "exports['.'].node.import",
						},
					})
				})
			})

			describe('with platform="neutral"', () => {
				const platform = 'neutral' as const

				it('by default, ESM loads all from import', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...esmOpts,
						platform,
						outdir: `${cwd}/dist/esbuild-${platform}/esm`,
					})

					const esbuildNodeEsm = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/esm/index.mjs`.json()
					expect(esbuildNodeEsm).toEqual({
						client: {
							filename: 'client.mjs',
							resolvedFrom: "exports['.'].import",
						},
						index: {
							filename: 'index.mjs',
							resolvedFrom: "exports['.'].import",
						},
						runtime: {
							filename: 'runtime.mjs',
							resolvedFrom: "exports['.'].import",
						},
					})
				})

				it('with custom conditions, ESM loads all from import', async () => {
					const { default: esbuild } = await import('esbuild')

					await esbuild.build({
						...esmOpts,
						platform,
						outdir: `${cwd}/dist/esbuild-${platform}/esm`,
						conditions: ['import'],
					})

					const esbuildNodeEsmConditions = await $`${jsRuntime} ${cwd}/dist/esbuild-${platform}/esm/index.mjs`.json()
					expect(esbuildNodeEsmConditions).toEqual({
						client: {
							filename: 'client.mjs',
							resolvedFrom: "exports['.'].import",
						},
						index: {
							filename: 'index.mjs',
							resolvedFrom: "exports['.'].import",
						},
						runtime: {
							filename: 'runtime.mjs',
							resolvedFrom: "exports['.'].import",
						},
					})
				})
			})
		})
	})

	describe('Vite', () => {
		it('CJS loads always from require', async () => {
			await $`bun run bundle:vite:cjs`.quiet()
			const viteCjs = await $`${jsRuntime} ${cwd}/dist/vite/cjs/index.cjs`.json()
			expect(viteCjs).toEqual({
				client: {
					filename: 'client.cjs',
					resolvedFrom: "exports['.'].require",
				},
				index: {
					filename: 'index.cjs',
					resolvedFrom: "exports['.'].require",
				},
				runtime: {
					filename: 'runtime.cjs',
					resolvedFrom: "exports['.'].require",
				},
			})
		})

		it('ESM loads always from import', async () => {
			await $`bun run bundle:vite:esm`.quiet()
			const viteEsm = await $`${jsRuntime} ${cwd}/dist/vite/esm/index.mjs`.json()
			expect(viteEsm).toEqual({
				client: {
					filename: 'client.mjs',
					resolvedFrom: "exports['.'].import",
				},
				index: {
					filename: 'index.mjs',
					resolvedFrom: "exports['.'].import",
				},
				runtime: {
					filename: 'runtime.mjs',
					resolvedFrom: "exports['.'].import",
				},
			})
		})
	})

	// Note: Workerd can only import ESM files, written in either TypeScript or JavaScript.
	describe('Cloudflare Workerd', () => {
		it('imports TypeScript files directly, preferably from workerd.import', async () => {
			await $`bun run bundle:workerd:ts`.quiet()
			const workerdTs = await $`${pm} workerd test workerd.ts.capnp`.json()
			expect(workerdTs).toEqual({
				client: {
					filename: 'client-workerd.ts',
					resolvedFrom: "exports['.'].workerd.import",
				},
				index: {
					filename: 'index.mjs',
					resolvedFrom: "exports['.'].import",
				},
				runtime: {
					filename: 'runtime-workerd.ts',
					resolvedFrom: "exports['.'].workerd.import",
				},
			})
		})
	})

	describe('Webpack', () => {
		it('CJS loads runtime from node.require, rest from require', async () => {
			await $`bun bundle:webpack:cjs`.quiet()
			const webpackCjs = await $`${jsRuntime} ${cwd}/dist/webpack/cjs/index.cjs`.json()
			expect(webpackCjs).toEqual({
				client: {
					filename: 'client.cjs',
					resolvedFrom: "exports['.'].require",
				},
				index: {
					filename: 'index.cjs',
					resolvedFrom: "exports['.'].require",
				},
				runtime: {
					filename: 'runtime-node.cjs',
					resolvedFrom: "exports['.'].node.require",
				},
			})
		})

		it('ESM loads runtime from node.require, rest from require', async () => {
			await $`bun bundle:webpack:esm`.quiet()
			const webpackEsm = await $`${jsRuntime} ${cwd}/dist/webpack/esm/index.mjs`.json()
			expect(webpackEsm).toEqual({
				client: {
					filename: 'client.cjs',
					resolvedFrom: "exports['.'].require",
				},
				index: {
					filename: 'index.cjs',
					resolvedFrom: "exports['.'].require",
				},
				runtime: {
					filename: 'runtime-node.cjs',
					resolvedFrom: "exports['.'].node.require",
				},
			})
		})
	})

	describe('RsBuild', () => {
		it('ESM loads runtime from node.import, rest from import', async () => {
			await $`bun bundle:rsbuild:esm`.quiet()
			const rsbuildEsm = await $`${jsRuntime} ${cwd}/dist/rsbuild/esm/index.js`.json()
			expect(rsbuildEsm).toEqual({
				client: {
					filename: 'client.mjs',
					resolvedFrom: "exports['.'].import",
				},
				index: {
					filename: 'index.mjs',
					resolvedFrom: "exports['.'].import",
				},
				runtime: {
					filename: 'runtime-node.mjs',
					resolvedFrom: "exports['.'].node.import",
				},
			})
		})
	})
})
