#!/usr/bin/env node
// Post-deploy smoke test. `buildspace promote` tells you the rollout finished;
// this tells you the app actually serves.
//
//   bun run smoke https://your-app.up.railway.app
//
// Exits non-zero on the first failure, so it can gate a release step.

const base = (process.argv[2] ?? process.env.SMOKE_URL ?? "").replace(/\/$/, "");

if (!base) {
  console.error("Usage: bun run smoke <url>");
  console.error("   or: SMOKE_URL=<url> bun run smoke");
  process.exit(2);
}

const TIMEOUT_MS = 15_000;

async function request(pathname, { redirect = "follow" } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${base}${pathname}`, { redirect, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const checks = [
  {
    name: "health endpoint responds",
    async run() {
      const response = await request("/api/health");
      if (!response.ok) return `expected 200, got ${response.status}`;
      const body = await response.json();
      if (body.db !== "ok") return `database is "${body.db}" — migrations may not have run`;
      return null;
    },
  },
  {
    name: "landing page renders",
    async run() {
      const response = await request("/");
      return response.ok ? null : `expected 200, got ${response.status}`;
    },
  },
  {
    name: "dashboard is protected",
    async run() {
      const response = await request("/dashboard", { redirect: "manual" });
      // proxy.ts redirects signed-out visitors. A 200 here means the guard is
      // not running — the most important thing this script can catch.
      if (response.status >= 300 && response.status < 400) return null;
      return `expected a redirect for a signed-out visitor, got ${response.status}`;
    },
  },
  {
    name: "authenticated API rejects anonymous callers",
    async run() {
      const response = await request("/api/me", { redirect: "manual" });
      return response.status === 401 ? null : `expected 401, got ${response.status}`;
    },
  },
];

let failed = 0;
console.log(`Smoke testing ${base}\n`);

for (const check of checks) {
  try {
    const failure = await check.run();
    if (failure) {
      failed += 1;
      console.error(`  FAIL  ${check.name} — ${failure}`);
    } else {
      console.log(`  ok    ${check.name}`);
    }
  } catch (err) {
    failed += 1;
    console.error(`  FAIL  ${check.name} — ${err instanceof Error ? err.message : String(err)}`);
  }
}

if (failed > 0) {
  console.error(
    `\n${failed} check(s) failed. Check logs: buildspace deploy logs --env prod --latest`,
  );
  process.exit(1);
}

console.log("\nAll checks passed.");
