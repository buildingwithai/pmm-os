import type { db } from "@/lib/cloud/db";

type Sql = NonNullable<ReturnType<typeof db>>;

/**
 * Ensure the signed-in identity has a users row — and MERGE any pre-Clerk
 * account with the same email (the PMM_OS_SYNC_TOKENS bootstrap creates
 * boot_* users keyed by email). Without the merge, a Google/Clerk sign-in
 * whose email already exists violates users_email_key and 500s the workspace.
 *
 * Merge = re-own everything (engagements, assets, sync devices, edit history)
 * to the Clerk id, then drop the old row. Product-name collisions between the
 * two accounts get a " (merged)" suffix rather than failing the sign-in.
 */
export async function ensureUser(sql: Sql, userId: string, email: string): Promise<void> {
  if (email) {
    const [existing] = (await sql`SELECT id FROM users WHERE email = ${email}`) as Array<{ id: string }>;
    if (existing && existing.id !== userId) {
      const old = existing.id;
      await sql`INSERT INTO users (id, email) VALUES (${userId}, ${email + ".merging"}) ON CONFLICT (id) DO NOTHING`;
      await sql`
        UPDATE engagements SET product_name = product_name || ' (merged)'
        WHERE owner_id = ${old} AND product_name IN (SELECT product_name FROM engagements WHERE owner_id = ${userId})
      `;
      await sql`UPDATE engagements SET owner_id = ${userId} WHERE owner_id = ${old}`;
      await sql`UPDATE assets SET owner_id = ${userId} WHERE owner_id = ${old}`;
      await sql`UPDATE sync_devices SET owner_id = ${userId} WHERE owner_id = ${old}`;
      await sql`UPDATE kit_block_history SET edited_by = ${userId} WHERE edited_by = ${old}`;
      await sql`DELETE FROM users WHERE id = ${old}`;
      await sql`UPDATE users SET email = ${email} WHERE id = ${userId}`;
      return;
    }
  }
  // email is UNIQUE — an empty email would collide across users, so the
  // no-email path gets a per-id placeholder until a real one arrives
  const value = email || `${userId}@placeholder.invalid`;
  await sql`
    INSERT INTO users (id, email) VALUES (${userId}, ${value})
    ON CONFLICT (id) DO UPDATE
    SET email = CASE WHEN ${email} <> '' THEN ${value} ELSE users.email END
  `;
}
