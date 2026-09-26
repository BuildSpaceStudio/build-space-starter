import { createUploadRoute } from "@buildspacestudio/sdk/next";
import { withAuth } from "@/lib/api-auth";
import { getServerClient } from "@/lib/buildspace";

// Browser uploads go through this route: it checks the session, picks the
// storage key, issues a size-locked signed URL, and confirms the upload. The
// browser PUTs the file straight to storage and never sees a key or token.
// `useUpload` from `@buildspacestudio/sdk/react` is the client half.
const upload = createUploadRoute(getServerClient(), {
  maxSize: 10 * 1024 * 1024,
  // Keep the `files/{userId}/` prefix the Files page lists.
  keyFor: ({ file, session }) =>
    `files/${session.user.id}/${crypto.randomUUID()}-${file.filename.replace(/[^A-Za-z0-9._-]+/g, "-").slice(-100)}`,
});

export const POST = withAuth((request) => upload(request));
