# AGENTS

## Project

BuildSpace starter app using Next.js App Router + TypeScript + Tailwind CSS + BuildSpace SDK.

## Commands

- `bun install` - Install dependencies
- `bun dev` - Start dev server (http://localhost:3000)
- `bun run build` - Production build (run before deploying)
- `bun run lint` - Run Biome linter

## BuildSpace CLI

Authentication is required for deploy and env commands:

```
buildspace auth login              # Browser-based login
buildspace auth show               # Show current token
buildspace auth clear              # Remove stored token
```

Deployments:

```
buildspace deploy                  # Push HEAD to origin/main → triggers dev deploy
buildspace deploy status           # View deployment status for dev/prod
buildspace deploy logs --env dev --latest  # View latest dev deployment logs
```

Environment variables:

```
buildspace env list [--env dev|prod]
buildspace env set KEY=VALUE [--env dev|prod] [--secret]
buildspace env unset KEY [--env dev|prod]
buildspace env pull [--env dev|prod]
```

## BuildSpace SDK

This project uses `@buildspacestudio/sdk` for authentication, events, storage, and notifications.

### Required environment variables

```
BUILDSPACE_SECRET_KEY=bs_sec_...                          # server-only
NEXT_PUBLIC_BUILDSPACE_PUBLISHABLE_KEY=bs_pub_...         # browser-safe
```

Copy `.env.example` to `.env.local` and fill in your keys from the BuildSpace dashboard.

### SDK entry points

- **Server**: `import { getServerClient } from "@/lib/buildspace"` — singleton using secret key
- **Browser**: `import { getBrowserClient } from "@/lib/buildspace-client"` — singleton using publishable key

### Key files

| Path | Purpose |
|------|---------|
| `lib/buildspace.ts` | Server SDK singleton |
| `lib/buildspace-client.ts` | Browser SDK singleton |
| `app/api/auth/callback/route.ts` | OAuth callback handler |
| `app/api/auth/session/route.ts` | Session validation |
| `app/api/auth/logout/route.ts` | Logout + revocation |
| `app/api/events/route.ts` | Server-side event tracking |
| `app/api/storage/route.ts` | Storage operations |
| `app/api/notifications/route.ts` | Email sending |
| `app/examples/page.tsx` | Interactive SDK examples |

### SDK documentation

For full API reference, see `.claude/skills/buildspace-sdk.md` or fetch the latest from:
- https://docs.buildspace.studio/llms-full.txt
- https://docs.buildspace.studio/docs

## Feature Development Workflow

1. **Implement** the feature or fix
2. **Verify**: `bun run build` must pass
3. **Commit**: Use conventional commit format (`feat:`, `fix:`, `refactor:`, `chore:`)
4. **Deploy**: `buildspace deploy` pushes to origin/main and triggers deployment
5. **Monitor**: `buildspace deploy status` to check deployment progress

## Guidelines

- Keep changes small and incremental
- App slug is auto-detected from git remote origin
- All deploys go to dev environment by default
- The repository is the source of truth for deployments
- Use `getServerClient()` for server-side SDK access, `getBrowserClient()` for client-side
- Never expose `BUILDSPACE_SECRET_KEY` to the browser
- Store session tokens in HTTP-only cookies, not localStorage
