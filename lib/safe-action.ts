import { createSafeActionClient } from "next-safe-action";
import { getSession } from "@/lib/auth";

export const action = createSafeActionClient();

export const authAction = createSafeActionClient().use(async ({ next }) => {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return next({ ctx: { session } });
});
