#!/usr/bin/env node
// Wraps `drizzle-kit generate` with a destructive-change check.
//
// Renaming a column in schema.ts makes drizzle-kit emit DROP + ADD, and
// `railway.json`'s preDeployCommand applies migrations automatically on the
// next deploy — so a rename that looks harmless in review deletes production
// data on ship. This refuses to leave a destructive migration on disk unless
// you ask for it explicitly:
//
//   bun db:generate                        # blocks, explains, rolls back
//   bun db:generate --allow-destructive    # you've read it and you mean it
//
// Everything else passes straight through to drizzle-kit.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, "..", "drizzle");
const META_DIR = path.join(MIGRATIONS_DIR, "meta");
const JOURNAL = path.join(META_DIR, "_journal.json");

const DESTRUCTIVE = [
  { pattern: /\bDROP\s+TABLE\b/i, what: "drops a table" },
  { pattern: /\bDROP\s+COLUMN\b/i, what: "drops a column" },
  { pattern: /\bDROP\s+INDEX\b/i, what: "drops an index" },
  // Drizzle's SQLite strategy for altering a column is table recreation.
  { pattern: /__old_push_/i, what: "recreates a table (data is copied, constraints may change)" },
];

function listing(dir) {
  try {
    return new Set(readdirSync(dir));
  } catch {
    return new Set();
  }
}

const args = process.argv.slice(2);
const allowDestructive = args.includes("--allow-destructive");
const passthrough = args.filter((arg) => arg !== "--allow-destructive");

// Snapshot everything drizzle-kit touches, so a rejected migration can be
// rolled back completely — SQL, meta snapshots, and the journal that indexes
// them. Deleting only the .sql would leave the journal pointing at a file that
// no longer exists.
const beforeMigrations = listing(MIGRATIONS_DIR);
const beforeMeta = listing(META_DIR);
const beforeJournal = existsSync(JOURNAL) ? readFileSync(JOURNAL, "utf8") : null;

const result = spawnSync("bunx", ["drizzle-kit", "generate", ...passthrough], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);

const createdSql = [...listing(MIGRATIONS_DIR)].filter(
  (file) => file.endsWith(".sql") && !beforeMigrations.has(file),
);
if (createdSql.length === 0) process.exit(0);

const findings = [];
for (const file of createdSql) {
  const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
  for (const line of sql.split("\n")) {
    for (const { pattern, what } of DESTRUCTIVE) {
      if (pattern.test(line)) findings.push({ file, what, line: line.trim() });
    }
  }
}

if (findings.length === 0) {
  console.log(`\nGenerated ${createdSql.join(", ")} — no destructive statements.`);
  process.exit(0);
}

console.error("\n─────────────────────────────────────────────────────────────");
console.error("This migration destroys data:\n");
for (const finding of findings) {
  console.error(`  ${finding.file}  ${finding.what}`);
  console.error(`    ${finding.line}\n`);
}

if (allowDestructive) {
  console.error("Kept it, because you passed --allow-destructive.");
  console.error("Check that production data in those columns is backed up or expendable.");
  console.error("─────────────────────────────────────────────────────────────\n");
  process.exit(0);
}

// Roll back every artifact this run produced.
for (const file of createdSql) unlinkSync(path.join(MIGRATIONS_DIR, file));
for (const file of listing(META_DIR)) {
  if (!beforeMeta.has(file)) unlinkSync(path.join(META_DIR, file));
}
if (beforeJournal !== null) writeFileSync(JOURNAL, beforeJournal);

console.error("Rolled it back — drizzle/ is untouched. Your schema.ts edit is still there.");
console.error("\nIf you were renaming a column, do it in three safe steps instead:");
console.error("  1. Add the new column (nullable), generate + migrate.");
console.error("  2. Backfill it from the old one, and write to both for a release.");
console.error("  3. Drop the old column once nothing reads it.");
console.error("\nIf the data really is expendable: bun db:generate --allow-destructive");
console.error("─────────────────────────────────────────────────────────────\n");
process.exit(1);
