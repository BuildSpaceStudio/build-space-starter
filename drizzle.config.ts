import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.BUILDSPACE_DB_URL || "file:local.db",
    // drizzle-kit's turso dialect requires a non-empty authToken even for
    // local file DBs (the libsql client itself works fine without one) — the
    // fallback keeps `bun db:migrate` working out of the box before a real
    // BUILDSPACE_DB_TOKEN is configured.
    authToken: process.env.BUILDSPACE_DB_TOKEN || "unused",
  },
});
