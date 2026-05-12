import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.BUILDSPACE_DB_URL || "file:local.db",
  authToken: process.env.BUILDSPACE_DB_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
