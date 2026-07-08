import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { todos, users } from "./schema";

// Standalone client (not lib/db/index.ts): that module is `server-only` and
// can't be imported from a tsx script.
const db = drizzle(
  createClient({
    url: process.env.BUILDSPACE_DB_URL || "file:local.db",
    authToken: process.env.BUILDSPACE_DB_TOKEN,
  }),
);

// Local-dev seed: a super_admin user plus sample todos so `bun db:migrate &&
// bun db:seed && bun dev` gives a populated dashboard. Hard-guarded to the
// local file DB — real environments get users from real sign-ins, never seeds.
const SEED_BUILDSPACE_USER_ID = "seed_local_admin";

async function main() {
  const dbUrl = process.env.BUILDSPACE_DB_URL;
  if (dbUrl && !dbUrl.startsWith("file:")) {
    console.error("Seed refused: BUILDSPACE_DB_URL points at a remote database.");
    console.error("Seeding is for local file DBs only (file:local.db).");
    process.exit(1);
  }

  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    console.log("Seed skipped: users already exist.");
    return;
  }

  const [admin] = await db
    .insert(users)
    .values({
      buildspaceUserId: SEED_BUILDSPACE_USER_ID,
      email: "admin@local.test",
      name: "Local Admin",
      role: "super_admin",
    })
    .returning();

  await db.insert(todos).values([
    { userId: admin.buildspaceUserId, text: "Read AGENTS.md" },
    { userId: admin.buildspaceUserId, text: "Explore the dashboard slices" },
    { userId: admin.buildspaceUserId, text: "Deploy with `buildspace deploy`", completed: true },
  ]);

  console.log("Seeded 1 super_admin user (admin@local.test) and 3 todos.");
  console.log("Note: real sign-ins create their own users — this data is only for local UI work.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
