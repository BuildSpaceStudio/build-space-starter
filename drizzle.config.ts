import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.BUILDSPACE_DB_URL || "file:local.db",
    authToken: process.env.BUILDSPACE_DB_TOKEN,
  },
});
