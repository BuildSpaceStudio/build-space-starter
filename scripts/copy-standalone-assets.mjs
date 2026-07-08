import { cpSync, existsSync } from "node:fs";

// `output: "standalone"` deliberately skips static assets and public/ —
// copy them in so `node .next/standalone/server.js` serves everything.
// https://nextjs.org/docs/app/api-reference/config/next-config-js/output
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
if (existsSync("public")) {
  cpSync("public", ".next/standalone/public", { recursive: true });
}
