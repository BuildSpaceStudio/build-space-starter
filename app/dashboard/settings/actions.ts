"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { upsertUserFromSession } from "@/lib/db/users";
import { authActionClient } from "@/lib/safe-action";

// Read-modify-write against the local users table, keyed on the BuildSpace
// user id from the session — the pattern for any per-user preference.
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

    await db
      .update(schema.users)
      .set({
        name: parsedInput.name || null,
        marketingOptIn: parsedInput.marketingOptIn,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.buildspaceUserId, ctx.session.user.id));

    revalidatePath("/dashboard/settings");
  });

export const updateAvatar = authActionClient
  .inputSchema(z.object({ key: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    // Enforce the avatars/{userId} path convention so users can only point
    // their profile at files they uploaded.
    if (parsedInput.key !== `avatars/${ctx.session.user.id}`) {
      throw new Error("Invalid avatar key");
    }

    await db
      .update(schema.users)
      .set({ avatarUrl: parsedInput.key, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.buildspaceUserId, ctx.session.user.id));

    revalidatePath("/dashboard/settings");
  });
