# Package Resolution

[![CI](https://github.com/jkomyno/package-resolution/actions/workflows/ci.yml/badge.svg)](https://github.com/jkomyno/package-resolution/actions/workflows/ci.yml)

This project showcases how different bundlers and runtimes resolve imports from a package that uses `exports` maps in its `package.json`. The goal is to understand the inconsistencies and document them.

The test suite in [`packages/import-test/bundler.test.ts`](packages/import-test/bundler.test.ts) runs a series of tests against different bundlers (ESBuild, Vite, Webpack, RsBuild) and runtimes (Node.js, Bun, Deno, Cloudflare Workerd). It checks which file is resolved for different subpaths of an example package ([`@jkomyno/exported-pkg`](@jkomyno/exported-pkg)).

The exports map in `@jkomyno/exported-pkg` is structured as follows:

- `package.json#/exports/.`: Simplest entry, with no platform-specific condition.
  ```json
  "exports": {
    ".": {
      "types": "./src/index.d.ts",
      "require": "./src/index.cjs",
      "import": "./src/index.mjs",
      "default": "./src/index.js"
    }
  }
  ```
- `package.json#/exports/client`: Uses conditional runtime names according to the [WinterCG Runtime Keys specification](https://runtime-keys.proposal.wintercg.org/), but it doesn't include `node`.
  ```json
  "exports": {
    ".": {
      "./client": {
        "types": "./src/client/client.d.ts",
        "workerd": {
          "import": "./src/client/client-workerd.ts"
        },
        "bun": {
          "import": "./src/client/client-bun.ts"
        },
        "deno": {
          "import": "./src/client/client-deno.ts",
          "default": "./src/client/client-deno.js"
        },
        "require": "./src/client/client.cjs",
        "import": "./src/client/client.mjs",
        "default": "./src/client/client.js"
      }
    }
  }
  ```
- `package.json#/exports/runtime`: Uses conditional runtime names, including `node`.
  ```json
  "exports": {
    "./runtime": {
      "types": "./src/runtime/runtime.d.ts",
      "worker": {
        "import": "./src/runtime/runtime-worker.ts"
      },
      "workerd": {
        "import": "./src/runtime/runtime-workerd.ts"
      },
      "bun": {
        "import": "./src/runtime/runtime-bun.ts"
      },
      "deno": {
        "import": "./src/runtime/runtime-deno.ts",
        "default": "./src/runtime/runtime-deno.js"
      },
      "node": {
        "types": "./src/runtime/runtime-node.d.ts",
        "require": "./src/runtime/runtime-node.cjs",
        "import": "./src/runtime/runtime-node.mjs",
        "default": "./src/runtime/runtime-node.js"
      },
      "require": "./src/runtime/runtime.cjs",
      "import": "./src/runtime/runtime.mjs",
      "default": "./src/runtime/runtime.js"
    }
  }
  ```

## Key Findings

The main takeaway is that package resolution behavior is not consistent among bundlers. It's also influenced by bundler-specific settings, such as `platform` on ESBuild, or by plugins in Vite.

### Runtimes

| Runtime | Behavior |
| --- | --- |
| **Bun** | Prefers `bun.import`, falling back to `import`. It can resolve TypeScript files without requiring any transpilation. |
| **Deno** | Prefers `deno.import`, falling back to `import`. It can resolve TypeScript files without requiring any transpilation. |
| **Cloudflare Workerd** | Prefers `workerd.import`. when resolving TypeScript files. |

### Bundlers

Here's a summary of how different bundlers resolve package exports. The tests are run for both CommonJS (CJS) and ECMAScript Modules (ESM) outputs.

#### ESBuild

ESBuild's resolution is heavily influenced by the `platform` setting. Its behavior can be further customized by specifying custom `conditions` in the build options.

With default `conditions`:

| Platform | Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- | --- |
| `node` | CJS | `exports['.'].import` | `exports['.'].import` | `exports['.'].node.import` |
| `node` | ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].node.import` |
| `neutral` | CJS | `exports['.'].import` | `exports['.'].import` | `exports['.'].import` |
| `neutral` | ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].import` |

With custom `conditions`:
  - When `format: 'cjs'`, set `conditions: ['require']`

| Platform | Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- | --- |
| `node` | CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].node.require` |
| `neutral` | CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].require` |

- **With `platform: 'node'`**: ESBuild correctly prefers the `node` conditional export for `package.json#/exports/runtime`, but it defaults to `import` subpaths even when `format: 'cjs'`. While this is documented behavior, it can lead to errors when library authors expect `require` to be used for CJS outputs. The workaround is to set `conditions: ['require']` in the build options.
- **With `platform: 'neutral'`**: ESBuild falls back to the standard `require` and `import` fields, ignoring the `node` conditional export as intended.

#### Rolldown

Rolldown's resolution behavior is very similar to ESBuild, as it's designed to be compatible with ESBuild's API and behavior.

With default `conditionNames`:

| Platform | Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- | --- |
| `node` | CJS | `exports['.'].import` | `exports['.'].import` | `exports['.'].node.import` |
| `node` | ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].node.import` |
| `neutral` | CJS | `exports['.'].import` | `exports['.'].import` | `exports['.'].import` |
| `neutral` | ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].import` |

With custom `conditionNames`:
  - When `format: 'cjs'`, set `conditionNames: ['require']`

| Platform | Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- | --- |
| `node` | CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].node.require` |
| `neutral` | CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].require` |

- **With `platform: 'node'`**: Rolldown correctly prefers the `node` conditional export for `package.json#/exports/runtime`, but like ESBuild, it defaults to `import` subpaths even when `format: 'cjs'`. The workaround is to set `conditionNames: ['require']` in the resolve options.
- **With `platform: 'neutral'`**: Rolldown falls back to the standard `require` and `import` fields, ignoring the `node` conditional export as intended.

#### Vite

Vite's behavior is consistent and predictable.

| Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- |
| CJS | `exports['.'].require` | `exports['.'].require` | `exports['.'].require` |
| ESM | `exports['.'].import` | `exports['.'].import` | `exports['.'].import` |

Vite does not follow the [WinterCG Runtime Keys specification](https://runtime-keys.proposal.wintercg.org/), so it never picks the `node` conditional export.

#### Vite + `@cloudflare/vite-plugin`

When using the `@cloudflare/vite-plugin`, Vite's behavior changes to prefer `exports['.'].workerd.import` over `exports['.'].import`. Only the ESM format is supported by the Cloudflare Workerd runtime.

| Format | `index` resolution | `client` resolution | `runtime` resolution |
| --- | --- | --- | --- |
| ESM | `exports['.'].import` | `exports['.'].workerd.import` | `exports['.'].workerd.import` |

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

RsBuild correctly uses the `node` conditional export for the `package.json#/exports/runtime` when bundling for ESM.

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

## FAQ

- Why did you create this project?

  I was going crazy trying to debug an issue involving `@prisma/client`, ESBuild, and `format: 'cjs'`. That lead me to investigate how different bundlers resolve package exports, especially when using the `exports` field in `package.json`.

## 👤 Author

Hi, I'm **Alberto Schiabel**, you can follow me on:

- Github: [@jkomyno](https://github.com/jkomyno)
- Twitter: [@jkomyno](https://twitter.com/jkomyno)

## 🦄 Show your support

Give a ⭐️ if this project helped or inspired you!

## 📝 License

Built with ❤️ by [Alberto Schiabel](https://github.com/jkomyno).<br />
This project is [MIT](https://github.com/jkomyno/package-resolution/blob/main/LICENSE) licensed.
