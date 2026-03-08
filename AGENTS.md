# AGENTS

## Project

BuildSpace starter app using Next.js App Router + TypeScript + Tailwind CSS.

## Commands

- `bun install` - Install dependencies
- `bun dev` - Start dev server (http://localhost:3000)
- `bun run build` - Production build (run before deploying)
- `bun run lint` - Run ESLint

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
