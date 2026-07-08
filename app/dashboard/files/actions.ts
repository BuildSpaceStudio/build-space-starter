"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerClient } from "@/lib/buildspace";
import { authActionClient } from "@/lib/safe-action";

// Files live under files/{userId}/ — every action verifies the caller owns the
// key's prefix before touching storage.
function assertOwnKey(key: string, userId: string) {
  if (!key.startsWith(`files/${userId}/`)) {
    throw new Error("You don't have access to this file");
  }
}

// Server-signed download: the browser never sees storage credentials, just a
// short-lived URL minted on demand.
export const getFileDownloadUrl = authActionClient
  .inputSchema(z.object({ key: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    assertOwnKey(parsedInput.key, ctx.session.user.id);
    const bs = getServerClient();
    const { url } = await bs.storage.getSignedUrl(parsedInput.key, { expiresIn: 300 });
    return { url };
  });

export const deleteFile = authActionClient
  .inputSchema(z.object({ key: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    assertOwnKey(parsedInput.key, ctx.session.user.id);
    const bs = getServerClient();
    await bs.storage.delete(parsedInput.key);
    revalidatePath("/dashboard/files");
  });
