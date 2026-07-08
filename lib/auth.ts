import { cookies } from "next/headers";
import { getServerClient } from "@/lib/buildspace";
import type { UserRecord } from "@/lib/db/schema";
import { getUserByBuildspaceId } from "@/lib/db/users";

export async function getSession() {
  const jar = await cookies();
  const token = jar.get("bs_session")?.value;
  if (!token) return null;
  try {
    const bs = getServerClient();
    const session = await bs.auth.getSession(token);
    return session ? { ...session, token } : null;
  } catch {
    return null;
  }
}

// Session plus the local user record (role, preferences). `record` is null only
// for sessions created before the callback upsert existed — treat as "member".
export async function getCurrentUser(): Promise<{
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
  record: UserRecord | null;
  role: "member" | "super_admin";
} | null> {
  const session = await getSession();
  if (!session) return null;

  let record: UserRecord | null = null;
  try {
    record = await getUserByBuildspaceId(session.user.id);
  } catch (err) {
    console.error("[auth] local user lookup failed", err);
  }

  return { session, record, role: record?.role ?? "member" };
}
