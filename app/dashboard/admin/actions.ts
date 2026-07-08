"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { adminActionClient } from "@/lib/safe-action";

// adminActionClient re-checks the caller's role server-side on every call —
// hiding the nav entry is cosmetic, this is the real gate.
export const setUserRole = adminActionClient
  .inputSchema(
    z.object({
      userId: z.string().min(1),
      role: z.enum(["member", "super_admin"]),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.userId === ctx.user.id) {
      throw new Error("You can't change your own role");
    }

    await db
      .update(schema.users)
      .set({ role: parsedInput.role, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, parsedInput.userId));

    revalidatePath("/dashboard/admin");
  });
