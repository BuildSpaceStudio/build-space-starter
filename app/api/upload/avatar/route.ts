import { createUploadRoute } from "@buildspacestudio/sdk/next";
import { withAuth } from "@/lib/api-auth";
import { getServerClient } from "@/lib/buildspace";
import { updateAvatarUrl } from "@/lib/db/users";

// Avatar uploads: the key is always under `avatars/{userId}/`, and the users
// row is updated server-side once the upload is confirmed — the browser never
// says which key to store.
const upload = createUploadRoute(getServerClient(), {
  allowedContentTypes: ["image/png", "image/jpeg"],
  maxSize: 2 * 1024 * 1024,
  keyFor: ({ session }) => `avatars/${session.user.id}/${crypto.randomUUID()}`,
  onUploadComplete: async ({ session, key }) => {
    await updateAvatarUrl({ buildspaceUserId: session.user.id, avatarUrl: key });
  },
});

export const POST = withAuth((request) => upload(request));
