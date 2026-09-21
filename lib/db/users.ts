import "server-only";
import { desc, eq } from "drizzle-orm";
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

// The users table is keyed on the BuildSpace user id rather than an owned
// `userId` column, so it doesn't go through `scopedTo()`. Queries against it
// live here instead, where each one can state who is allowed to run it.

/** Self-service profile update — scoped to the caller's own row. */
export async function updateProfile({
  buildspaceUserId,
  name,
  marketingOptIn,
}: {
  buildspaceUserId: string;
  name: string | null;
  marketingOptIn: boolean;
}): Promise<void> {
  await db
    .update(schema.users)
    .set({ name, marketingOptIn, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.buildspaceUserId, buildspaceUserId));
}

/** Self-service avatar update — scoped to the caller's own row. */
export async function updateAvatarUrl({
  buildspaceUserId,
  avatarUrl,
}: {
  buildspaceUserId: string;
  avatarUrl: string;
}): Promise<void> {
  await db
    .update(schema.users)
    .set({ avatarUrl, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.buildspaceUserId, buildspaceUserId));
}

/** Admin-only: every user record. Callers must be behind `adminActionClient`/`withAdmin`. */
export async function listUsers(): Promise<UserRecord[]> {
  return db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
}

/** Admin-only: change another user's role. Callers must be behind `adminActionClient`. */
export async function setUserRole({
  userId,
  role,
}: {
  userId: string;
  role: UserRecord["role"];
}): Promise<void> {
  await db
    .update(schema.users)
    .set({ role, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.id, userId));
}
