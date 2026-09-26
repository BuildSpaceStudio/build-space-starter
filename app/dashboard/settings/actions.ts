"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateProfile as updateProfileRecord, upsertUserFromSession } from "@/lib/db/users";
import { authActionClient } from "@/lib/safe-action";

// The `users` table is keyed on the BuildSpace user id, not an owned `userId`
// column, so these go through the helpers in `lib/db/users.ts` rather than
// `scopedTo()`. Either way, app code never builds the query itself.
export const updateProfile = authActionClient
  .inputSchema(
    z.object({
      name: z.string().trim().max(100),
      marketingOptIn: z.boolean(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    // Ensure the local record exists (sessions can predate the callback upsert).
    await upsertUserFromSession({
      buildspaceUserId: ctx.session.user.id,
      email: ctx.session.user.email,
      name: ctx.session.user.name,
    });

    await updateProfileRecord({
      buildspaceUserId: ctx.session.user.id,
      name: parsedInput.name || null,
      marketingOptIn: parsedInput.marketingOptIn,
    });

    revalidatePath("/dashboard/settings");
  });
