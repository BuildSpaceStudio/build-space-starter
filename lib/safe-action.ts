import { createSafeActionClient } from "next-safe-action";
import { getSession } from "@/lib/auth";
import { getUserByBuildspaceId } from "@/lib/db/users";

export const actionClient = createSafeActionClient();

export const authActionClient = createSafeActionClient().use(async ({ next }) => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return next({ ctx: { session } });
});

// Authorization tiers stack as middleware: actionClient (public) →
// authActionClient (valid session) → adminActionClient (session + local role).
// Copy this shape to add new tiers (e.g. an "owner" check for team resources).
export const adminActionClient = authActionClient.use(async ({ ctx, next }) => {
  const user = await getUserByBuildspaceId(ctx.session.user.id);
  if (user?.role !== "super_admin") throw new Error("Forbidden");
  return next({ ctx: { user } });
});
