# AGENTS

BuildSpace starter app using Next.js App Router + TypeScript + Tailwind CSS v4 + BuildSpace SDK.

## Commands

Use `bun` — scripts are defined in `package.json`.

| Command | Purpose |
|---------|---------|
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun lint` | Biome lint check |
| `bun lint:fix` | Biome auto-fix |
| `bun typecheck` | TypeScript type check |

### Database (Drizzle + libSQL/Turso)

- Schema lives in `lib/db/schema.ts`. Import the client from `@/lib/db` (server-only).
- `bun db:generate` — create a new migration from schema changes.
- `bun db:migrate` — apply migrations to the DB at `BUILDSPACE_DB_URL` (defaults to `file:local.db`).
- `bun db:studio` — open Drizzle Studio.
- `bun db:seed` — run the seed script.

## Key files

| File | Purpose |
|------|---------|
| `lib/env.ts` | Typed env validation via `@t3-oss/env-nextjs` |
| `lib/safe-action.ts` | `action` (public) and `authAction` (requires session) |
| `lib/utils.ts` | `cn()` helper for conditional Tailwind classes |
| `middleware.ts` | Fast cookie-presence check protecting `/dashboard/*` |
| `components/ui/` | Button, Input, Card, Checkbox (uses `radix-ui` mono package) |

## Patterns

`app/dashboard/todos/` is the vertical slice example: schema → `authAction` + zod → `revalidatePath` → server component with `getSession()` guard → client components with `useAction` + `toast`. Copy this pattern for new features.

## Next.js 16 gotchas

- `cookies()` and `headers()` are **async** — always `await` them.
- Middleware runs in the **Edge runtime** — `next/headers` is NOT available. Read cookies from `request.cookies` instead.
- Server Components are the default — only add `"use client"` for hooks, browser APIs, or event handlers.
- `error.tsx` must be a Client Component (`"use client"`).

## Skills

Skills are in `.agents/skills/`. Read the relevant SKILL.md before implementing anything BuildSpace-related.

| Skill | Path | Use for |
|-------|------|---------|
| **buildspace-examples** | `.agents/skills/buildspace-examples/SKILL.md` | UI, auth flows, route protection, server actions, events, storage, email, database |
| **buildspace-sdk** | `.agents/skills/buildspace-sdk/SKILL.md` | SDK API details, env vars, error handling |
| **buildspace-cli** | `.agents/skills/buildspace-cli/SKILL.md` | Deploy, env management, auth CLI |

## Workflow

1. Implement → 2. Build (`bun build`) → 3. Commit (conventional format) → 4. Deploy (`buildspace deploy`)
