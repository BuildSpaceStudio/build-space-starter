// Route handlers that are deliberately reachable without a session.
//
// `proxy.ts` only guards `/dashboard/*`, so anything under `app/api/` is public
// unless it checks the session itself. `test/guardrails.test.ts` fails the
// build for any route that neither wraps its handlers in `withAuth`/`withAdmin`
// (see `lib/api-auth.ts`) nor appears here.
//
// Add an entry only when the route is genuinely public — a webhook, a health
// check, an OAuth callback, a public read API. The reason string is the point:
// it's what a reviewer (or you, in three months) reads to decide whether this
// is still true.

export const PUBLIC_ROUTES: Record<string, string> = {
  "app/api/health/route.ts": "Railway healthcheck — probes hit it unauthenticated by design.",
  "app/api/auth/callback/route.ts":
    "OAuth callback — the visitor has no session yet; the one-time code is the credential.",
  "app/api/auth/session/route.ts":
    "Reads the caller's own cookie and returns null when absent — exposes nothing a visitor doesn't already hold.",
  "app/api/auth/logout/route.ts":
    "Revokes only the token in the caller's own cookie; a request without one is a no-op.",
};
