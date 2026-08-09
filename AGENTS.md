# AGENTS

BuildSpace starter app using Next.js App Router + TypeScript + Tailwind CSS v4 + BuildSpace SDK. Every platform capability (auth, database, events, storage, email, billing) has one working example wired the preferred way — extend those examples instead of inventing new patterns.

## Commands

Use `bun` — scripts are defined in `package.json`.

| Command | Purpose |
|---------|---------|
| `bun dev` | Start dev server |
| `bun build` | Production build (standalone output + asset copy) |
| `bun start` | Run the built standalone server |
| `bun lint` | Biome lint check |
| `bun lint:fix` | Biome auto-fix |
| `bun typecheck` | TypeScript type check |
| `bun run test` | Vitest unit tests |
| `bun run verify` | The full gate: lint + typecheck + build + test |

### Database (Drizzle + libSQL/Turso)

- Schema lives in `lib/db/schema.ts`. Import the client from `@/lib/db` (server-only).
- `bun db:generate` — create a new migration from schema changes (never hand-write migrations).
- `bun db:migrate` — apply migrations to the DB at `BUILDSPACE_DB_URL` (defaults to `file:local.db`). Deploys run this automatically (`railway.json` → `preDeployCommand`).
- `bun db:studio` — open Drizzle Studio.
- `bun db:seed` — seed a local super_admin + sample todos. Refuses to run against remote DBs.

### Local dev flow

```bash
cp .env.example .env.local   # add your two BuildSpace keys
bun install && bun db:migrate && bun db:seed && bun dev
```

Real sign-ins create their own `users` rows via the auth callback; the seeded user only makes local UI work populated.

## Key files

| File | Purpose |
|------|---------|
| `lib/env.ts` | Typed env validation via `@t3-oss/env-nextjs` — every new env var goes here **and** in `.env.example` |
| `lib/auth.ts` | `getSession()` (session only) and `getCurrentUser()` (session + local record + role) |
| `lib/safe-action.ts` | Action tiers: `actionClient` → `authActionClient` → `adminActionClient` |
| `lib/analytics.ts` | `trackEvent()` — server-side events that never throw |
| `lib/email.ts` | Transactional email; one exported function per message type |
| `lib/billing.ts` | Billing helpers; feature-detects the SDK namespace, degrades gracefully |
| `lib/db/users.ts` | Local user mirror (`upsertUserFromSession`, `getUserByBuildspaceId`) |
| `lib/utils.ts` | `cn()` + `formatBytes()` |
| `proxy.ts` | Fast cookie-presence check protecting `/dashboard/*` |
| `components/ui/` | The UI kit (see below) |
| `components/page-header.tsx`, `components/empty-state.tsx` | Shared composition patterns used by every slice |
| `components/site-header.tsx`, `components/dashboard-nav.tsx` | App shell |

## `lib/` helper conventions

- **Analytics**: server code always goes through `trackEvent` from `lib/analytics.ts`; client components call `getBrowserClient().events.track(...)` directly (batched). Analytics must never break the app.
- **Email**: lives in `lib/email.ts`, one function per message type, inline HTML template, failures logged never thrown.
- **Billing**: never call `bs.billing.*` outside `lib/billing.ts` — add a helper there.
- **Graceful degradation rule**: any page rendering data from a BuildSpace service must catch `BuildspaceError` and render an `<EmptyState>` instead of crashing. A fresh clone with only the two keys must build and run everywhere.

## Auth tiers

1. `actionClient` — public.
2. `authActionClient` — validates the session cookie; injects `ctx.session`.
3. `adminActionClient` — additionally requires the local user's `role` to be `super_admin`; injects `ctx.user`.

Pages mirror the same tiers: `getSession()` guard for member pages, `getCurrentUser()` + role check for admin pages (`app/dashboard/admin/page.tsx`). Nav visibility is cosmetic — the server always re-checks.

## UI kit

`components/ui/` has: button, input, card, checkbox, label, textarea, select, badge, avatar, skeleton, table, tabs, switch, dialog, dropdown-menu — shadcn-style on the `radix-ui` mono package + cva.

- **Check `components/ui/` first.** If a primitive is missing, add it there in the same cva style.
- **Never install a component library** (no `npx shadcn add`, no MUI/Chakra/etc.).
- Use `<PageHeader>` at the top of every dashboard page and `<EmptyState>` for zero/unconfigured states.
- Every dashboard slice has a `loading.tsx` built from `<Skeleton>`.

## Patterns

Features are **vertical slices**: one folder under `app/dashboard/<slice>/` with page + actions + components, one nav entry, usually one table. `app/dashboard/todos/` is the reference slice. The full checklist is in `.agents/skills/buildspace-examples/references/new-feature-playbook.md`.

### Removing a slice

Each example slice is deletable:

1. Delete `app/dashboard/<slice>/`.
2. Remove its entry from `components/dashboard-nav.tsx` (and the card in `app/page.tsx`).
3. If it owns a table: remove it from `lib/db/schema.ts` and run `bun db:generate`.
4. Slice-specific extras: **files** also uses `lib/utils.ts#formatBytes`; **billing** also owns `lib/billing.ts` and `NEXT_PUBLIC_APP_URL` in `lib/env.ts`; **settings** owns the avatar flow (`users.avatarUrl`); **admin** owns `adminActionClient` in `lib/safe-action.ts`. Delete those with the slice if nothing else uses them.
5. `bun lint && bun typecheck && bun build`.

## Testing

Vitest, colocated `*.test.ts` files, `environment: "node"`. Two exemplars show the patterns to copy:

- `lib/utils.test.ts` — pure `lib/` helper test, no mocks.
- `app/dashboard/todos/actions.test.ts` — server-action test: mock the seams (`@/lib/auth`, `@/lib/db`, `@/lib/analytics`, `next/cache`) and call the action like the client would; assert data, `serverError`, and `validationErrors` paths.

`vitest.config.ts` aliases `server-only` to an empty stub (`test/stubs/server-only.ts`) so server-only modules import cleanly. New features should ship with a test — run `bun run test` (or the full `bun run verify`) before committing.

## Next.js 16 gotchas

- `cookies()` and `headers()` are **async** — always `await` them.
- Middleware runs in the **Edge runtime** — `next/headers` is NOT available. Read cookies from `request.cookies` instead.
- Server Components are the default — only add `"use client"` for hooks, browser APIs, or event handlers.
- `error.tsx` must be a Client Component (`"use client"`).

## Deployment

- `next.config.ts` sets `output: "standalone"`; `bun build` copies static assets into the standalone dir (`scripts/copy-standalone-assets.mjs`); `bun start` runs `node .next/standalone/server.js`.
- `railway.json`: Railpack build, `preDeployCommand: bun run db:migrate` (which is why `drizzle-kit` is a runtime dependency), healthcheck at `/api/health` (always 200, DB status in the body).
- **System packages?** Rename `Dockerfile.example` → `Dockerfile` and set `"builder": "DOCKERFILE"` in `railway.json`. The `deploy` block is builder-independent (migrations/healthcheck unchanged). Build with `SKIP_ENV_VALIDATION=1` — `lib/env.ts` honors it so server secrets don't need to be present at build time; `NEXT_PUBLIC_*` still must be passed as Docker build args.
- `buildspace deploy` pushes HEAD to the dev branch (`buildspace/dev`) and syncs the hosted dev environment. Add `--wait` to follow the deployment to a terminal state.

## Ship to production

Dev deploys never touch production — the production URL serves nothing until you roll out. When the app is ready (or the creator asks to "go live" / "ship it"):

```bash
buildspace promote --latest --yes --watch   # roll out the current dev branch, follow to completion
buildspace deploy status --env prod         # confirm prod is live and get the URL
```

`--yes` is required in non-interactive sessions; `--watch` exits non-zero if the rollout fails (then check `buildspace deploy logs --env prod --latest`). After a successful rollout, hit `<prod-url>/api/health` to verify the app responds. Full reference: `.agents/skills/buildspace-cli/SKILL.md`.

## Skills

Skills are in `.agents/skills/`. Read the relevant SKILL.md before implementing anything BuildSpace-related. The recipes point at real files in this repo — extend those.

| Skill | Path | Use for |
|-------|------|---------|
| **buildspace-examples** | `.agents/skills/buildspace-examples/SKILL.md` | New features, auth flows, route protection, server actions, events, storage, email, billing, database |
| **buildspace-sdk** | `.agents/skills/buildspace-sdk/SKILL.md` | SDK API details, env vars, error handling |
| **buildspace-cli** | `.agents/skills/buildspace-cli/SKILL.md` | Deploy, env management, auth CLI |

`.claude/skills/` and `.agents/skills/` must stay identical — update both (CI diffs them).

## Plans

Multi-step work (features, refactors) goes through `__plans__/`. When asked to plan a change, write a short plan there first — one file per effort, `<n>-<slug>.md` — recording the goal, files to touch, approach, risks, and a one-line `Status:`. Read any relevant existing plan in `__plans__/` before starting, and update its status line as work progresses. Plans are version-controlled alongside the code; read, edit, or delete them freely. Don't block on the creator approving a plan unless they ask — default to plan-then-execute when given the go-ahead.

## Workflow

1. Implement → 2. Verify (`bun run verify`) → 3. Commit (conventional format) → 4. Deploy to dev (`buildspace deploy`) → 5. When ready to go live: `buildspace promote --latest --yes --watch`
