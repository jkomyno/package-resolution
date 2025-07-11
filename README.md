# Bundler Resolution

This project showcases how different bundlers and runtimes resolve imports from a package that uses `exports` maps in its `package.json`. The goal is to understand the inconsistencies and document them.

The test suite in `bundler.test.ts` runs a series of tests against different bundlers (ESBuild, Vite, Webpack, RsBuild) and runtimes (Node.js, Bun, Deno, Cloudflare Workerd). It checks which file is resolved for different subpaths of an example package (`@jkomyno/exported-pkg`).

## Key Findings

The main takeaway is that bundler behavior is not consistent, and it's influenced by the `platform` or `target` settings, as well as the output format (CJS vs. ESM).

### Runtimes

| Runtime | Behavior |
| --- | --- |
| **Bun** | Prefers `bun.import` when resolving TypeScript files. |
| **Deno** | Prefers `deno.import` when resolving TypeScript files. |
| **Cloudflare Workerd** | Prefers `workerd.import` when resolving TypeScript files. |

### Bundlers

Here's a summary of how different bundlers resolve package exports. The tests are run for both CommonJS (CJS) and ECMAScript Modules (ESM) outputs.

#### ESBuild

ESBuild's resolution is heavily influenced by the `platform` setting. Its behavior can be further customized by specifying custom `conditions` in the build options. For example, setting `conditions: ['edge-light']` would make ESBuild prefer the `edge-light` conditional export, if present in the imported package's `package.json`.

| Platform | Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- | --- |
| `node` | CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].node.require` |
| `node` | ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].node.import` |
| `neutral` | CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].require` |
| `neutral` | ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].import` |

- **With `platform: 'node'`**: ESBuild correctly uses the `node` conditional export for the `runtime` subpath.
- **With `platform: 'neutral'`**: ESBuild falls back to the standard `require` and `import` fields, ignoring the `node` conditional export.

#### Vite

Vite's behavior is consistent and predictable.

| Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- |
| CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].require` |
| ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].import` |

Vite does not seem to automatically pick up the `node` conditional export, instead using the generic `require` or `import`.

#### Webpack

Webpack shows an interesting behavior, especially with ESM modules.

| Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- |
| CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].node.require` |
| ESM | `exports['.'].require` | `exports['.'].require` | `exports['.'].node.require` |

- **For CJS**: Webpack correctly uses `node.require` for the `runtime` subpath.
- **For ESM**: Webpack still resolves to `require` and `node.require` paths, which can be unexpected when bundling for an ESM target. This is likely due to how Webpack's `target: 'node'` interacts with module resolution.

#### RsBuild

RsBuild's behavior is similar to ESBuild with `platform: 'node'`.

| Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- |
| ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].node.import` |

RsBuild correctly uses the `node` conditional export for the `runtime` subpath when bundling for ESM.

## How to run

### Installation

First, install the dependencies:

```bash
bun install
```

### Testing

To run the test suite, which validates the behavior of different bundlers and runtimes, run:

```bash
bun test
```

## Conclusion

The way bundlers resolve package exports can be complex and depends on their configuration. For library authors, it's crucial to provide a comprehensive `exports` map to support various environments. For application developers, it's important to understand how their chosen bundler is configured, as it can affect which version of a library's code is included in the final bundle.

This investigation highlights the importance of testing against multiple bundlers to ensure that a package behaves as expected across the JavaScript ecosystem.
