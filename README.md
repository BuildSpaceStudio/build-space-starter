# BuildSpace Starter

Canonical Next.js starter template for BuildSpace apps. Every platform capability — auth, database, events, storage, email, and billing — ships with one small working example, organized as deletable vertical slices. Extend the slices you need; delete the rest.

> [!NOTE]
> This repository is a read-only mirror, automatically synced from the BuildSpace monorepo. Issues and discussions are welcome here, but pull requests can't be merged directly — direct commits are overwritten by the next sync.

## Prerequisites

- Node.js 24+ (see `.nvmrc`)
- A package manager: **npm** (included with Node), [pnpm](https://pnpm.io), or [Bun](https://bun.sh)

## Quick start

```bash
cp .env.example .env.local
# Fill in your keys from the BuildSpace dashboard:
#   BUILDSPACE_SECRET_KEY=bs_sec_...
#   NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY=bs_pub_...

npm install && npm run db:migrate && npm run db:seed && npm run dev
# or: pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev
# or: bun install && bun db:migrate && bun db:seed && bun dev
```

Open http://localhost:3000. The migrate + seed steps set up a local SQLite file (`local.db`) with sample data — no remote database needed for local work.

## What's included

| Feature | Where | What it demonstrates |
|---------|-------|----------------------|
| **App shell** | `components/site-header.tsx`, `app/dashboard/layout.tsx` | Auth-aware header with user menu, sidebar nav |
| **Auth** | `components/auth-provider.tsx`, `lib/auth.ts`, `app/api/auth/*` | OAuth flow, HTTP-only cookies, `useAuth()`, session helpers |
| **Local users** | `lib/db/users.ts`, `app/api/auth/callback/route.ts` | BuildSpace identity mirrored into your own `users` table; first-sign-in hook (signup event + welcome email) |
| **Todos slice** | `app/dashboard/todos/` | The canonical vertical slice: schema → safe action → server component → toasts |
| **Files slice** | `app/dashboard/files/` | Browser-direct uploads, server-signed downloads, path-ownership checks |
| **Billing slice** | `app/dashboard/billing/`, `lib/billing.ts` | Stripe checkout, customer portal, entitlement gating, test-mode banner |
| **Settings slice** | `app/dashboard/settings/` | Profile form (read-modify-write) + avatar upload |
| **Admin slice** | `app/dashboard/admin/` | Role-gated page and actions (`adminActionClient`) |
| **Analytics** | `lib/analytics.ts`, `components/analytics.tsx` | Server events that never break the app; batched client page views |
| **Email** | `lib/email.ts` | Transactional email, one function per message type |
| **Database** | `lib/db/`, `drizzle/` | Drizzle + Turso/libSQL with versioned migrations and a local file fallback |
| **UI kit** | `components/ui/` | 15 shadcn-style primitives on the `radix-ui` mono package |
| **Light/dark mode** | `components/theme-provider.tsx`, `components/theme-toggle.tsx` | Class-based theming with `next-themes` |

Every slice degrades gracefully when its backing service isn't configured — a fresh clone with only the two keys builds and runs.

Each slice is deletable: remove its folder, nav entry, and table. `AGENTS.md` has the exact removal steps.

## Building with AI

The project ships agent skills (in `.claude/skills/` and `.agents/skills/`) whose recipes point at the real files in this repo. Ask your AI assistant to "add a feature" and it will follow `references/new-feature-playbook.md` — the same vertical-slice checklist the built-in examples use.

### First prompt for your agent

Starting in your editor? Paste this into Claude Code, Codex, or any coding agent (replace the last line with your idea):

```text
You're working in a Buildspace starter app. Before writing any code:
1. Read AGENTS.md — it has the commands, conventions, and workflow.
2. Read the skills in .agents/skills/ (buildspace-examples, buildspace-sdk, buildspace-cli) —
   their recipes point at real files in this repo. Extend those patterns; don't invent new ones.
3. Verify your work with `bun run verify` before committing, and deploy to dev with `buildspace deploy`.

Now build: <describe your app idea here>
```

## Build

```bash
npm run build
# or: pnpm run build | bun run build
```

The build uses Next.js standalone output; `npm start` runs `node .next/standalone/server.js`.

## Deploy

From a BuildSpace-managed clone:

```bash
buildspace deploy
```

The repository is the source of truth for what gets deployed. Run `buildspace deploy status` to check progress.

What happens on Railway (configured in `railway.json`):

1. Railpack builds the app (`npm run build` → standalone output).
2. **Pre-deploy**: `bun run db:migrate` applies any pending Drizzle migrations against the managed database — schema changes ship with the code, no manual step.
3. The server starts and Railway health-checks `/api/health` (always fast-200; DB reachability is reported in the response body).

Environment variables in deployed environments:

- `BUILDSPACE_DB_URL` / `BUILDSPACE_DB_TOKEN` — **auto-injected** by BuildSpace when the app is created.
- `BUILDSPACE_SECRET_KEY` / `NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY` — from your BuildSpace dashboard.
- `NEXT_PUBLIC_APP_URL` — optional; set it to your public URL for billing redirect links.

## Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `BUILDSPACE_SECRET_KEY` | Server only | `bs_sec_...` — never expose to the browser |
| `NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY` | Browser safe | `bs_pub_...` — used by the client SDK |
| `BUILDSPACE_DB_URL` | Server only | libSQL/Turso URL; blank locally = `file:local.db` |
| `BUILDSPACE_DB_TOKEN` | Server only | libSQL auth token; blank for the local file DB |
| `NEXT_PUBLIC_APP_URL` | Browser safe | Optional absolute origin for billing redirects |

Get your keys from the [BuildSpace Creator Dashboard](https://creator.buildspace.studio).
