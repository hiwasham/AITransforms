/**
 * Module-resolution hooks for the served runtime (T100).
 *
 * The source tree uses the tsconfig `@/*` path alias and the TS-ESM
 * convention of importing `.ts` files with a `.js` suffix. tsc/vitest
 * resolve both; plain `node` does not. There is no build step, so these
 * sync hooks close the gap at runtime:
 *   1. `@/x` -> `<repo>/src/x`
 *   2. on resolution failure of a `.js` specifier, retry as `.ts`
 *
 * Used via `node --experimental-transform-types --import ./loader.mjs`
 * (see package.json `start`). transform-types (not plain strip) is
 * required because the code uses constructor parameter properties.
 */

import { registerHooks } from "node:module";

const srcRoot = new URL("./src/", import.meta.url);

registerHooks({
  resolve(specifier, context, nextResolve) {
    const spec = specifier.startsWith("@/")
      ? new URL(specifier.slice(2), srcRoot).href
      : specifier;
    try {
      return nextResolve(spec, context);
    } catch (error) {
      if (spec.endsWith(".js")) {
        return nextResolve(`${spec.slice(0, -3)}.ts`, context);
      }
      throw error;
    }
  },
});
