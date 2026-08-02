import { createDb, type Db } from "@/db/client.js";

/** In-memory PGLite instance for tests — no shared state between test files. */
export async function createTestDb(): Promise<Db> {
  return createDb(undefined);
}
