/**
 * PGLite connection helper. Owned exclusively by api/+domain/ (the core
 * service) — see schema.ts and plan.md Process Boundaries & Data Flow.
 */

import { PGlite } from "@electric-sql/pglite";
import { applySchema } from "./schema.js";

export type Db = PGlite;

/** dataDir: undefined = in-memory (tests); a path = persistent file store. */
export async function createDb(dataDir?: string): Promise<Db> {
  const db = new PGlite(dataDir);
  await applySchema(db);
  return db;
}
