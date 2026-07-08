import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// Railway's healthcheck hits this route. It always returns 200 fast — DB
// reachability is reported in the body, not the status code, so transient DB
// latency never flaps the deploy.
async function checkDb(): Promise<"ok" | "unreachable" | "timeout"> {
  const timeout = new Promise<"timeout">((resolve) => {
    setTimeout(() => resolve("timeout"), 1500);
  });
  const ping = db
    .run(sql`SELECT 1`)
    .then(() => "ok" as const)
    .catch(() => "unreachable" as const);
  return Promise.race([ping, timeout]);
}

export async function GET() {
  const dbStatus = await checkDb();
  return Response.json({ ok: true, db: dbStatus, timestamp: new Date().toISOString() });
}
