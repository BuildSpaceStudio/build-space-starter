import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  // Skip validation when SKIP_ENV_VALIDATION is set. Server secrets aren't
  // available at build time in a Dockerfile build (they're injected at
  // runtime), so `next build` would otherwise fail collecting page data.
  // Railpack builds leave this unset and validate as normal.
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  server: {
    BUILDSPACE_SECRET_KEY: z.string().min(1),
    BUILDSPACE_DB_URL: z.string().optional(),
    BUILDSPACE_DB_TOKEN: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY: z.string().min(1),
    // Absolute origin for redirect URLs (billing checkout/portal). Optional —
    // falls back to the request origin when unset.
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    BUILDSPACE_SECRET_KEY: process.env.BUILDSPACE_SECRET_KEY,
    BUILDSPACE_DB_URL: process.env.BUILDSPACE_DB_URL,
    BUILDSPACE_DB_TOKEN: process.env.BUILDSPACE_DB_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
