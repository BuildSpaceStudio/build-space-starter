import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BUILDSPACE_SECRET_KEY: z.string().min(1),
    BUILDSPACE_DB_URL: z.string().optional(),
    BUILDSPACE_DB_TOKEN: z.string().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    BUILDSPACE_SECRET_KEY: process.env.BUILDSPACE_SECRET_KEY,
    BUILDSPACE_DB_URL: process.env.BUILDSPACE_DB_URL,
    BUILDSPACE_DB_TOKEN: process.env.BUILDSPACE_DB_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY,
  },
});
