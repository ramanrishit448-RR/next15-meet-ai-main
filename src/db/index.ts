import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

type Db = ReturnType<typeof drizzle>;

let _db: Db | null = null;
function getDb(): Db {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment (e.g. .env.local) before using the database."
    );
  }

  const sql = neon(databaseUrl);
  _db = drizzle(sql);
  return _db;
}

// Lazily initialize so builds don't crash on import
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    return Reflect.get(getDb() as unknown as object, prop);
  },
}) as Db;
