import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_ROUTES } from "./public-routes";

// Guardrails that run as tests, so `bun run verify` enforces them.
//
// These are deliberately simple source scans, not a type-aware linter: each one
// catches a mistake that is cheap to make, expensive to ship, and invisible in
// review. Every rule has an escape hatch — a `// guardrail-ok: <reason>`
// comment on (or just above) the offending line, or an explicit allowlist —
// because a guardrail you can't get past when you're right is a guardrail
// people delete.
//
// A false positive is a bug in the rule. Fix the rule; don't delete the test.

const ROOT = path.resolve(__dirname, "..");
const SOURCE_EXT = new Set([".ts", ".tsx"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "drizzle", "out", "build"]);

function walk(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  let entries: string[];
  try {
    entries = readdirSync(abs);
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    if (SKIP_DIRS.has(entry)) return [];
    const rel = path.join(dir, entry);
    if (statSync(path.join(ROOT, rel)).isDirectory()) return walk(rel);
    return SOURCE_EXT.has(path.extname(entry)) ? [rel] : [];
  });
}

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), "utf8");
}

/** Lines of a file, with an "excused" flag for the `// guardrail-ok:` escape hatch. */
function linesOf(source: string): { number: number; text: string; excused: boolean }[] {
  const raw = source.split("\n");
  return raw.map((text, index) => ({
    number: index + 1,
    text,
    excused: text.includes("guardrail-ok:") || (raw[index - 1]?.includes("guardrail-ok:") ?? false),
  }));
}

const appFiles = walk("app");
const libFiles = walk("lib");
const routeFiles = appFiles.filter((file) => path.basename(file) === "route.ts");

describe("guardrails", () => {
  // Gap: `proxy.ts` only matches `/dashboard/*`, so a new route handler is
  // public by default. That is the single easiest way to ship an open endpoint
  // over your own database.
  it("every API route is authenticated or explicitly listed as public", () => {
    const offenders = routeFiles.filter((file) => {
      if (PUBLIC_ROUTES[file]) return false;
      const source = read(file);
      return !/\bwith(Auth|Admin)\s*\(/.test(source);
    });

    expect(
      offenders,
      `These route handlers are reachable without a session. Wrap them in withAuth()/withAdmin() ` +
        `from @/lib/api-auth, or — if they really are public — add them to test/public-routes.ts ` +
        `with a reason:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  it("the public-route allowlist has no stale entries", () => {
    const stale = Object.keys(PUBLIC_ROUTES).filter((file) => !routeFiles.includes(file));
    expect(
      stale,
      `Listed in test/public-routes.ts but no longer exist: ${stale.join(", ")}`,
    ).toEqual([]);
  });

  // Gap: a hand-written query that forgets `WHERE user_id = ?` reads or deletes
  // another tenant's rows. App code goes through scopedTo() (auto-scoped) or a
  // lib/db helper (where the authorization story is written down).
  it("app code never builds queries directly on the db client", () => {
    const offenders: string[] = [];
    for (const file of appFiles) {
      for (const line of linesOf(read(file))) {
        if (line.excused) continue;
        if (/\bdb\s*\n?\s*\.(select|insert|update|delete|run|query)\b/.test(line.text)) {
          offenders.push(`${file}:${line.number}`);
        }
      }
    }

    expect(
      offenders,
      `Direct db access in app code. Use scopedTo(userId) from @/lib/db/scoped for user-owned ` +
        `tables, or add a helper in lib/db/ for queries that aren't user-scoped:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  // Gap: an unbounded string input is an unbounded row, an unbounded log line,
  // and — anywhere it reaches a paid API — an unbounded bill.
  it("every action input string and array is bounded", () => {
    const offenders: string[] = [];
    const schemaFiles = [...appFiles, ...libFiles].filter((file) =>
      read(file).includes("inputSchema"),
    );

    for (const file of schemaFiles) {
      for (const line of linesOf(read(file))) {
        if (line.excused) continue;
        const declaresUnbounded = /z\.(string|array)\s*\(/.test(line.text);
        if (declaresUnbounded && !line.text.includes(".max(")) {
          offenders.push(`${file}:${line.number}`);
        }
      }
    }

    expect(
      offenders,
      `Unbounded z.string()/z.array() in an action input. Add .max(...) so a request can't send ` +
        `an arbitrarily large payload:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  // Gap: a server-only module imported from a client component either fails the
  // build or — worse, for config-shaped modules — ships to the browser.
  it("client components never import server-only modules", () => {
    // Exact module specifiers: `@/lib/db/schema` (types only) and
    // `@/lib/buildspace-client` are fine in the browser, `@/lib/db` is not.
    const serverOnly = [
      "@/lib/db",
      "@/lib/db/users",
      "@/lib/db/scoped",
      "@/lib/buildspace",
      "@/lib/billing",
      "@/lib/email",
      "@/lib/log",
      "@/lib/auth",
      "@/lib/api-auth",
    ];
    const offenders: string[] = [];

    for (const file of [...appFiles, ...walk("components")]) {
      const source = read(file);
      if (!/^["']use client["']/m.test(source)) continue;
      for (const mod of serverOnly) {
        if (source.includes(`from "${mod}"`)) offenders.push(`${file} → ${mod}`);
      }
    }

    expect(
      offenders,
      `Client components importing server-only modules. Move the work into a server action or ` +
        `pass the data down as a prop:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  // Gap: the fastest way to break a BuildSpace app is to bolt a second platform
  // onto it — a parallel auth system, a second ORM, a second UI kit. The app
  // still builds; it just stops being maintainable or deployable as one thing.
  it("no dependency duplicates a platform capability", () => {
    const banned: Record<string, string> = {
      "next-auth": "auth is lib/auth.ts + the BuildSpace SDK",
      "@auth/core": "auth is lib/auth.ts + the BuildSpace SDK",
      "@clerk/nextjs": "auth is lib/auth.ts + the BuildSpace SDK",
      "@supabase/supabase-js": "the database is Turso + Drizzle (lib/db/)",
      prisma: "the ORM is Drizzle (lib/db/schema.ts)",
      "@prisma/client": "the ORM is Drizzle (lib/db/schema.ts)",
      firebase: "storage, auth and events are all BuildSpace SDK namespaces",
      "@mui/material": "the UI kit is components/ui/",
      "@chakra-ui/react": "the UI kit is components/ui/",
      "react-bootstrap": "the UI kit is components/ui/",
      "@aws-sdk/client-s3": "file storage is bs.storage (see app/dashboard/files/)",
      nodemailer: "transactional email is lib/email.ts",
      resend: "transactional email is lib/email.ts",
    };

    const pkg = JSON.parse(read("package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const installed = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const offenders = installed
      .filter((name) => name in banned)
      .map((name) => `${name} — ${banned[name]}`);

    expect(
      offenders,
      `These packages duplicate something the platform already provides:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  // Gap: secrets read ad hoc in a page or action skip lib/env.ts's validation,
  // and a NEXT_PUBLIC_-shaped typo silently ships a server secret to the client.
  it("app code reads config through lib/env.ts", () => {
    const offenders: string[] = [];
    for (const file of appFiles) {
      for (const line of linesOf(read(file))) {
        if (line.excused) continue;
        if (line.text.includes("process.env")) offenders.push(`${file}:${line.number}`);
      }
    }

    expect(
      offenders,
      `Raw process.env in app code. Declare the variable in lib/env.ts (and .env.example), then ` +
        `import { env }:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  // Not a security rule — a consistency one. Slices without a loading.tsx flash
  // blank on navigation, which is the difference between "feels built" and
  // "feels generated".
  it("every dashboard slice has a loading state", () => {
    const slices = readdirSync(path.join(ROOT, "app/dashboard"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const offenders = slices.filter(
      (slice) => !appFiles.includes(path.join("app/dashboard", slice, "loading.tsx")),
    );

    expect(
      offenders,
      `Dashboard slices missing loading.tsx (copy one from a sibling slice): ${offenders.join(", ")}`,
    ).toEqual([]);
  });
});
