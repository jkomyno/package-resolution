import { $ } from 'bun'

const jsRuntime = 'bun' satisfies 'node' | 'bun'

async function main() {
	console.log('Running Bun + TypeScript')
	const bunTs = await $`bun --silent run bun:ts`.text()
	console.log(bunTs)

	console.log('Running Deno + TypeScript')
	const denoTs = await $`deno --quiet run deno:ts`.text()
	console.log(denoTs)

	console.log('Running ESBuild + CJS + platform="node"')
	await $`bun bundle:esbuild:node:cjs`.quiet()
	const esbuildNodeCjs = await $`${jsRuntime} ./dist/esbuild-node/cjs/index.cjs`.text()
	console.log(esbuildNodeCjs)

	console.log('Running ESBuild + CJS + platform="neutral"')
	await $`bun bundle:esbuild:neutral:cjs`.quiet()
	const esbuildNeutralCjs = await $`${jsRuntime} ./dist/esbuild-neutral/cjs/index.cjs`.text()
	console.log(esbuildNeutralCjs)

	console.log('Running ESBuild + ESM + platform="node"')
	await $`bun bundle:esbuild:node:esm`.quiet()
	const esbuildNodeEsm = await $`${jsRuntime} ./dist/esbuild-node/esm/index.mjs`.text()
	console.log(esbuildNodeEsm)

	console.log('Running ESBuild + ESM + platform="neutral"')
	await $`bun bundle:esbuild:neutral:esm`.quiet()
	const esbuildNeutralEsm = await $`${jsRuntime} ./dist/esbuild-neutral/esm/index.mjs`.text()
	console.log(esbuildNeutralEsm)

	console.log('Running Vite + CJS')
	await $`bun --silent run bundle:vite:cjs`.quiet()
	const viteCjs = await $`${jsRuntime} ./dist/vite/cjs/index.cjs`.text()
	console.log(viteCjs)

	console.log('Running Vite + ESM')
	await $`bun --silent run bundle:vite:esm`.text()
	const viteEsm = await $`${jsRuntime} ./dist/vite/esm/index.mjs`.text()
	console.log(viteEsm)

	console.log('Running Vite + Workerd + TypeScript')
	await $`bun --silent run bundle:workerd:ts`.text()
	const workerdTs = await $`bun workerd test workerd.ts.capnp`.text()
	console.log(workerdTs)

	console.log('Running Webpack + CJS')
	await $`bun --silent bundle:webpack:cjs`.text()
	const webpackCjs = await $`${jsRuntime} ./dist/webpack/cjs/index.cjs`.text()
	console.log(webpackCjs)

	console.log('Running Webpack + ESM')
	await $`bun --silent bundle:webpack:esm`.quiet()
	const webpackEsm = await $`${jsRuntime} ./dist/webpack/esm/index.mjs`.text()
	console.log(webpackEsm)

	console.log('Running RsBuild + ESM')
	await $`bun --silent bundle:rsbuild:esm`.quiet()
	const rsbuildEsm = await $`${jsRuntime} ./dist/rsbuild/esm/index.js`.text()
	console.log(rsbuildEsm)
}

main()
