# AGENTS

BuildSpace starter app using Next.js App Router + TypeScript + Tailwind CSS + BuildSpace SDK.

## Commands

Use `npm`, `pnpm`, or `bun` — scripts are defined in `package.json` (dev, build, lint).

### Database (Drizzle + libSQL/Turso)

- Schema lives in `lib/db/schema.ts`. Import the client from `@/lib/db` (server-only).
- `npm run db:generate` — create a new migration from schema changes.
- `npm run db:migrate` — apply migrations to the DB at `BUILDSPACE_DB_URL` (defaults to `file:local.db`).
- `npm run db:studio` — open Drizzle Studio.
- `npm run db:seed` — run the seed script.

## Skills

Skills are in `.agents/skills/`. Read the relevant SKILL.md before implementing anything BuildSpace-related.

| Skill | Path | Use for |
|-------|------|---------|
| **buildspace-examples** | `.agents/skills/buildspace-examples/SKILL.md` | UI, auth flows, route protection, server actions, events, storage, email, database |
| **buildspace-sdk** | `.agents/skills/buildspace-sdk/SKILL.md` | SDK API details, env vars, error handling |
| **buildspace-cli** | `.agents/skills/buildspace-cli/SKILL.md` | Deploy, env management, auth CLI |

## Workflow

1. Implement → 2. Build (`npm run build`) → 3. Commit (conventional format) → 4. Deploy (`buildspace deploy`)
