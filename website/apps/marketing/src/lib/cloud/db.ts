import { neon } from "@neondatabase/serverless";

/**
 * Cloud database client (Neon serverless over HTTP — no pools to manage).
 * DATABASE_URL is server-env only. Absent env degrades to null so marketing
 * pages never crash; cloud routes must check and return a clear 503.
 */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export type SyncIdentity = { userId: string; email: string; deviceName: string };
