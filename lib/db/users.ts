import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { UserRecord } from "@/lib/db/schema";

// Local user records mirror BuildSpace identity: one row per BuildSpace user,
// keyed on users_buildspace_user_id_idx. App data (role, preferences, avatar)
// hangs off this row, never off the remote identity directly.

export async function getUserByBuildspaceId(buildspaceUserId: string): Promise<UserRecord | null> {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.buildspaceUserId, buildspaceUserId))
    .limit(1);
  return user ?? null;
}

export async function upsertUserFromSession({
  buildspaceUserId,
  email,
  name,
}: {
  buildspaceUserId: string;
  email: string;
  name: string | null;
}): Promise<{ user: UserRecord; isNewUser: boolean }> {
  const existing = await getUserByBuildspaceId(buildspaceUserId);

  if (existing) {
    const [user] = await db
      .update(schema.users)
      .set({ email, name, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, existing.id))
      .returning();
    return { user, isNewUser: false };
  }

  const [user] = await db
    .insert(schema.users)
    .values({ buildspaceUserId, email, name })
    .returning();
  return { user, isNewUser: true };
}
