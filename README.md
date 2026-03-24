# BuildSpace Starter

Canonical Next.js starter template for BuildSpace apps. Ships with authentication, the BuildSpace SDK, and light/dark mode — nothing else. Add features as you need them.

## Prerequisites

- Node.js 24+ (see `.nvmrc`)
- A package manager: **npm** (included with Node), [pnpm](https://pnpm.io), or [Bun](https://bun.sh)

## Quick start

```bash
cp .env.example .env.local
# Fill in your keys from the BuildSpace dashboard:
#   BUILDSPACE_SECRET_KEY=bs_sec_...
#   NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY=bs_pub_...

npm install && npm run dev
# or: pnpm install && pnpm dev
# or: bun install && bun dev
```

Open http://localhost:3000.

## What's included

| Feature             | Files                                                                               |
| ------------------- | ----------------------------------------------------------------------------------- |
| **SDK singletons**  | `lib/buildspace.ts` (server), `lib/buildspace-client.ts` (browser)                  |
| **Session helper**  | `lib/auth.ts` — shared `getSession()` for server-side auth checks                   |
| **Auth routes**     | `app/api/auth/callback/`, `session/`, `logout/` — OAuth flow with HTTP-only cookies |
| **Light/dark mode** | `components/theme-provider.tsx`, `components/theme-toggle.tsx`                      |

## Available SDK features

The BuildSpace SDK also provides **event tracking**, **file storage**, and **email notifications**. These aren't wired up in the starter — add them when your app needs them.

If you're using an AI coding assistant, ask it to add these features. The project includes skills (in `.claude/skills/`) with complete recipes for each one.

## Build

```bash
npm run build
# or: pnpm run build | bun run build
```

## Deploy

From a BuildSpace-managed clone:

```bash
buildspace deploy
```

The repository is the source of truth for what gets deployed. Run `buildspace deploy status` to check progress.

## Environment variables

| Variable                                 | Where        | Description                                |
| ---------------------------------------- | ------------ | ------------------------------------------ |
| `BUILDSPACE_SECRET_KEY`                  | Server only  | `bs_sec_...` — never expose to the browser |
| `NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY` | Browser safe | `bs_pub_...` — used by the client SDK      |

Get your keys from the [BuildSpace Creator Dashboard](https://creator.buildspace.studio).
