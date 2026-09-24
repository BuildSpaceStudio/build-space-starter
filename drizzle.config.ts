import { defineConfig } from "drizzle-kit";

// Deployed containers (Railway sets RAILWAY_ENVIRONMENT) must migrate the real
// database. Without this guard a missing BUILDSPACE_DB_URL fell back to
// `file:local.db`, so the pre-deploy `bun run db:migrate` "succeeded" against
// a throwaway file while production kept an empty schema.
const deployed = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_ENVIRONMENT_NAME);
if (deployed && !process.env.BUILDSPACE_DB_URL) {
  throw new Error(
    "BUILDSPACE_DB_URL is not set in this deployed environment, so migrations would run against a throwaway local file. Check the app's database env vars (`buildspace env list --env prod`) and redeploy.",
  );
}

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
