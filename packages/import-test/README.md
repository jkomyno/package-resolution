# @jkomyno/import-test
----

This package is a test suite for bundler resolution behavior across different JavaScript bundlers and runtimes. It specifically tests how various bundlers resolve package exports, particularly focusing on the [`@jkomyno/exported-pkg`](../exported-pkg/README.md) package.

## Bundling

This project contains several scripts to bundle the code using different bundlers and configurations. You can find them in the `scripts` section of `package.json`. Each script bundles `src/index.ts` and then runs the output.

Here is an exhaustive list of the available commands:

- **ESBuild**
  - `bun run esbuild:node:cjs`: Bundles for a `node` platform target in CJS format.
  - `bun run esbuild:node:esm`: Bundles for a `node` platform target in ESM format.
  - `bun run esbuild:neutral:cjs`: Bundles for a `neutral` platform target in CJS format.
  - `bun run esbuild:neutral:esm`: Bundles for a `neutral` platform target in ESM format.

- **Vite**
  - `bun run vite:cjs`: Bundles in CJS format.
  - `bun run vite:esm`: Bundles in ESM format.

- **Webpack**
  - `bun run webpack:cjs`: Bundles for a `node` target in CJS format.
  - `bun run webpack:esm`: Bundles for a `node` target in ESM format.

- **RsBuild**
  - `bun run rsbuild:esm`: Bundles for a `node` target in ESM format.

- **Cloudflare Workerd**
  - `bun run workerd:ts`: Bundles `src/index.ts` using Vite with the `@cloudflare/vite-plugin` and runs it in a `workerd` environment, configured via `workerd.ts.capnp`.

You can also run individual bundling or starting scripts (e.g., `bun run bundle:esbuild:node:cjs`).

To run all checks for all bundlers and runtimes, you can use the `all` script:

```bash
bun run all
```
