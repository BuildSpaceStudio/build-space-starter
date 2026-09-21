"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { setUserRole as setUserRoleRecord } from "@/lib/db/users";
import { adminActionClient } from "@/lib/safe-action";

// adminActionClient re-checks the caller's role server-side on every call —
// hiding the nav entry is cosmetic, this is the real gate. The query itself
// lives in `lib/db/users.ts`, marked admin-only, so the one place that can
// write another user's row is easy to find and review.
export const setUserRole = adminActionClient
  .inputSchema(
    z.object({
      userId: z.string().min(1).max(64),
      role: z.enum(["member", "super_admin"]),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.userId === ctx.user.id) {
      throw new Error("You can't change your own role");
    }

    await setUserRoleRecord({ userId: parsedInput.userId, role: parsedInput.role });

    revalidatePath("/dashboard/admin");
  });
